const ADODB = require("node-adodb");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// Path to your MDB file
// const dbPath = "W:/test/Access/Tablas.mdb;";
const dbPath = "./Tablas.mdb";

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
const port = 5002;
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use(morgan("tiny"));

app.post("/data", (req, res) => {
    const { fromDate, toDate, callOff } = req.body;
    const todayDate = new Date().toISOString();
    const dateSplit = todayDate.split("T")[0];
    try {
        const connection = ADODB.open(
            `Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${dbPath};`
        );
        connection
            .query(
                `SELECT [OF].[PinOrd], [OF].[NumOrd], [OF].[ArtOrd], [OF].[LanOrd], [OF].[PieOrd], [OF].[PreOrd], [OF].[PlaOrd], [OF].[Datos], [OF].[EntOrd], [OF].[Location], [OF].[DtoOrd], [OF].[EntCli], [OF].[Observaciones], [PC].[PedPed], [PC].[NumPed],[PC].[FecPed]
                 FROM [Ordenes de fabricación] AS [OF]
                 INNER JOIN [Pedidos de clientes] AS [PC] ON [OF].[PinOrd] = [PC].[NumPed]
                 WHERE [OF].[EntOrd] BETWEEN #${fromDate}# AND #${toDate}#
                 AND ([OF].[FinOrd] IS NULL OR [OF].[FinOrd] = DateValue('01/01/1970'))
                ${callOff ? "" : "AND [OF].[Datos] NOT LIKE '%@%'"}`
            )
            .then((data) => {
                if (fromDate > dateSplit) {
                    res.send([]);
                } else {
                    res.send(data);
                }
            })
            .catch((error) => {
                console.log(error);
                res.status(500).send("Internal Server Error");
            });
    } catch (error) {
        console.log(error);
    }
});

app.get("/clientes", (req, res) => {
    try {
        const connection = ADODB.open(
            `Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${dbPath};`
        );
        connection
            .query(
                `SELECT (Codcli),(Divisa) 
                FROM [Clientes]`
            )
            .then((data) => {
                // Filter out clients with Divisa 'Rs'
                // const filteredData = data.filter(
                //     (client) => client.Divisa !== "Rs"
                // );
                res.send(data);
            })
            .catch((error) => {
                res.status(500).send("Internal Server Error");
            });
    } catch (error) {
        console.log(error);
    }
});
app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
