import { useEffect, useRef, useState } from "react";
import TableData from "./Components/TableData";
import axiosClient from "./utils/axiosClient";
import ReactLoadingTopBar from "react-top-loading-bar";
import toast, { Toaster } from "react-hot-toast";
import ExcelJS from "exceljs";
import { IoMdArrowDropdown } from "react-icons/io";

function App() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [callOff, setCallOff] = useState(true);
    const [selectedClient, setSelectedClient] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [label, setLabel] = useState("All Pending Orders");
    const [fromDate, setFromDate] = useState("2017-01-01");
    const [toDate, setToDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    // console.log(selectedClient);
    // console.log(filteredData);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(0);
    const [client, setClient] = useState([]);


    const [companyCode, setCompanyCode] = useState([]); // store company code of each element in data

    const tableRef = useRef(null);
    const loadingBar = useRef(null);
    const dropdownRef = useRef(null);

    const toggleItem = (item) => {
        if (selectedClient.includes(item.Codcli)) {
            setSelectedClient(
                selectedClient.filter(
                    (selectedItem) => selectedItem !== item.Codcli
                )
            );
        } else {
            setSelectedClient([...selectedClient, item.Codcli]);
        }
    };

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const response = await axiosClient.get("/clientes");
                setClient(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchClient();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        submitHandle();
        setSelectedClient([]);
    }, [callOff]);

    const clientFilterData = client.filter((element) =>
        companyCode.includes(element.Codcli)
    );

    function currency(ArtOrd,client){
        const d = client.filter((element) => element.Codcli === ArtOrd.substring(0, 6));
        const currency = d.map((item)=>item.Divisa)
        return currency[0]
    }

    async function submitHandle() {
        // e.preventDefault();
        setLoading(true);
        setLabel("All Pending Orders");
        loadingBar.current?.continuousStart();
        try {
            const response = await axiosClient.post("/data", {
                fromDate,
                toDate,
                callOff,
            });

            if (fromDate > toDate) {
                toast.error("Invalid Date");
                // setFilteredData([])
                return;
            } else {
                setData(response.data);
                setFilteredData(response.data); // Update filtered data when fetching new data
                setCompanyCode(
                    response.data.map((element) =>
                        element.ArtOrd.substring(0, 6)
                    )
                );
                setLocation(0);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
            loadingBar.current.complete();
        }
    }


    function filterData(location) {
        console.log(location);
        let updatedData;
        if (location === 8) {
            // Filter data for location 1 or location 2
            updatedData = data.filter((element) => {
                if(selectedClient.length === 0){
                    return element.Location === 1 || element.Location === 2;
                }else{
                    return selectedClient.includes(element.ArtOrd.substring(0, 6)) && element.Location === 1 || selectedClient.includes(element.ArtOrd.substring(0, 6)) && element.Location === 2;
                }
            });
            console.log(updatedData);
        } else {
            // For other locations
            updatedData = data.filter((element) => {
                if(selectedClient.length === 0){
                    return element.Location === location;
                }else{
                    return selectedClient.includes(element.ArtOrd.substring(0, 6)) && element.Location === location;
                }
            });
            console.log(updatedData);
        }
        // setCompanyCode(
        //     updatedData.map((element) => element.ArtOrd.substring(0, 6))
        // );
        setFilteredData(updatedData);
    }


    function worlesDeliveryDate(EntOrd,Datos,NumOrd,Location){
        let date = new Date(EntOrd)

        if(Datos.includes("?") && Datos.includes("#")){
            date.setDate(date.getDate() + 29);
        }
        else if(Datos.includes("?") || Datos.includes("#")){
            date.setDate(date.getDate() + 22);
            
        }
        else if(Location === 2 && NumOrd > 180347){
            date.setDate(date.getDate() + 21);}

        else{
            date.setDate(date.getDate() + 15);
        }
        return date?.toISOString();
    }
    // console.log(data);

    // console.log(worlesDeliveryDate("2024-04-24T18:30:00Z","?#"));

    

    function filterDataByClient() {
    if (selectedClient.length === 0) {
        setFilteredData(data);
        setLabel("All Pending Orders");
        setLocation(0)
        return;
    }

    setIsOpen(!isOpen);

    const updateData = data.filter((element) => {
        if (location === 0) {
            return selectedClient.includes(element.ArtOrd.substring(0, 6));
        } else if (location === 1) {
            return selectedClient.includes(element.ArtOrd.substring(0, 6)) && element.Location === 1;
        } else if (location === 2) {
            return selectedClient.includes(element.ArtOrd.substring(0, 6)) &&  element.Location === 2;
        } else if(location === 7){
            return selectedClient.includes(element.ArtOrd.substring(0, 6)) &&  element.Location === 7;
        }
         else if (location === 8) {
            return selectedClient.includes(element.ArtOrd.substring(0, 6)) &&  (element.Location === 1 || element.Location === 2);
        }
        return false;
    });

    setFilteredData(updateData);
    setLabel(`Selected Clientes Pending Orders`);
}

    function exportToExcel() {
        // Sort filteredData based on companyCode
        const sortedData = filteredData.slice().sort((a, b) => {
            const codeA = a.ArtOrd.substring(0, 6);
            const codeB = b.ArtOrd.substring(0, 6);
            return codeA.localeCompare(codeB);
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${label}`);

        // Add headers
        const headerRow = worksheet.addRow([
            "Order No",
            "Order Date",
            "Delivery Date",
            "UID",
            "Article",
            "Description",
            "Total Qty",
            "Delivered Qty",
            "Pending Qty",
            "Discount",
            "Currency",
            "Price",
            "Cust.Ord.No",
            "Datos",
            "Observations",
            "Location",
            "Worles Delivery Date"
        ]);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "dcedb9" }, // Orange fill color
            };
        });

        // Add sorted data rows
        sortedData.forEach((item) => {
            worksheet.addRow([
                item.PinOrd,
                formatDate(item.FecPed),
                formatDate(item.EntOrd),
                item.NumOrd,
                item.ArtOrd,
                `DIE ${item.PlaOrd}`,
                item.PieOrd,
                item.EntCli,
                item.PieOrd - item.EntCli,
                `${item.DtoOrd}%`,
                currency(item.ArtOrd,client),
                item.PreOrd,
                item.PedPed,
                item.Datos,
                item.Observaciones,
                item.Location,
                formatDate(worlesDeliveryDate(item.EntOrd,item.Datos,item.NumOrd,item.Location))
            ]);
        });

        // Auto-size columns after adding data
        worksheet.columns.forEach((column) => {
            
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                cell.alignment = { vertical: "middle", horizontal: "center" };
                const columnLength = (cell.value || "").toString().length;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
        });
        const formateDate = new Date()
            .toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            .replace(/(\w+) (\d+), (\d+)/, "$2-$1-$3");

        const date = formatDate(formateDate);

        // Generate Excel file
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${label} ${date}.xlsx`; // Adjust the filename as needed
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    function formatDate(dateData) {
        const date = new Date(dateData)
            .toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            .replace(/(\w+) (\d+), (\d+)/, "$2-$1-$3");
        return date;
    }

    function calculateGrandTotal(data, clientFilterData) {
        const value = data.map((item) => {
            const totalPrice = (item.PieOrd - item.EntCli) * item.PreOrd;
            if (isNaN(totalPrice)) {
                return 0;
            }

            const discountPrice = totalPrice * (item.DtoOrd / 100);
            let price = totalPrice - discountPrice;

            const code = item.ArtOrd.substring(0, 6);

            const client = clientFilterData.find((c) => c.Codcli === code);
            if (client) {
                client.Divisa === "$"
                    ? (price = price * 0.94)
                    : client.Divisa === "Rs"
                    ? (price = price * 0.02)
                    : client.Divisa === "EU"
                    ? (price = price * 1)
                    : (price *= 1);
            }
            return price;
        });

        const grandTotal = value.reduce((a, b) => a + b, 0);
        const formatGrandTotal = grandTotal.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        });

        return formatGrandTotal;
    }

    const grandValue = calculateGrandTotal(filteredData, clientFilterData);
    const grandQty = filteredData.reduce((total, item) => {
        const qty = item.PieOrd - item.EntCli;
        return total + (qty < 0 ? 0 : qty);
    }, 0);


    return (
        <div className="w-full text-sm m-auto print:m-0 px-3 print:-ml-2">
            <Toaster position="top-center" reverseOrder={false} />
            <h1 className="text-3xl text-center font-semibold underline">
                List of Pending Orders
            </h1>
            <div>
                <div className="flex flex-wrap gap-3 px-5 py-3 mt-2 justify-center items-center ">
                    <div className="flex gap-4">
                        <div className="flex gap-1 justify-center items-center">
                            <label
                                htmlFor="fromDate"
                                className="block  ml-3 text-sm font-semibold  text-gray-700"
                            >
                                From Date
                            </label>
                            <input
                                type="date"
                                id="fromDate"
                                name="fromDate"
                                value={fromDate}
                                onChange={(e) => {
                                    setFromDate(e.target.value);
                                }}
                                className="mt-1 border-2 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="flex gap-1 justify-center items-center ml-5">
                            <label
                                htmlFor="toDate"
                                className="block text-sm font-semibold  text-gray-700"
                            >
                                To Date
                            </label>
                            <input
                                type="date"
                                id="toDate"
                                name="toDate"
                                value={toDate}
                                onChange={(e) => {
                                    setToDate(e.target.value);
                                }}
                                className="mt-1 border-2 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {/* <!-- Submit button --> */}
                    <button
                        type="submit"
                        onClick={submitHandle}
                        className="text-sm px-4 py-2 font-semibold border-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-400"
                    >
                        Submit
                    </button>

                    {/* <!-- Download button --> */}
                    <button
                        type="submit"
                        onClick={exportToExcel}
                        className="text-sm px-4 py-2 font-semibold border-2 rounded-md text-white bg-green-800 hover:bg-indigo-600"
                    >
                        Excel Download
                    </button>

                    {/* Drop Down filter */}

                    <div ref={dropdownRef} className="relative">
                        <div
                            className="flex select-none cursor-pointer items-center gap-3 border-2 px-2 py-2 font-semibold text-gray-600 rounded"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {selectedClient.length > 0 ? (
                                <span>{selectedClient.length} Selected</span>
                            ) : (
                                <h2>Select Client</h2>
                            )}
                            <IoMdArrowDropdown />
                        </div>
                        {isOpen && (
                            <div className="dropdown-content absolute w-full z-10 max-h-48 overflow-y-auto border bg-white border-gray-300 rounded">
                                <div className="dropdown-scroll px-3">
                                    <button
                                        className="bg-red-700 w-full text-white rounded-md"
                                        onClick={() => {
                                            setSelectedClient([]);
                                        }}
                                    >
                                        Clear
                                    </button>
                                    {clientFilterData.map((item, index) => (
                                        <span
                                            key={index}
                                            className="flex mb-[2px] gap-2 items-center"
                                        >
                                            <input
                                                className="cursor-pointer"
                                                type="checkbox"
                                                name={`check${index}`}
                                                id={`check${index}`}
                                                checked={selectedClient.includes(
                                                    item.Codcli
                                                )}
                                                onChange={() =>
                                                    toggleItem(item)
                                                }
                                            />
                                            <label
                                                className="cursor-pointer"
                                                htmlFor={`check${index}`}
                                            >
                                                {item.Codcli}
                                            </label>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={filterDataByClient}
                        className="text-sm px-4 py-2 font-semibold border-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-400"
                    >
                        Filter
                    </button>

                    {/* <!-- Filter buttons --> */}
                    <div className="flex items-center justify-center gap-3 ml-5">
                        <h2 className="font-semibold">Filter by :</h2>
                        <button
                            type="button"
                            onClick={() => {
                                filterData(1);
                                setLocation(1);
                                setLabel("AWS 1 Pending Orders");
                                // setSelectedClient([]);
                            }}
                            className={`px-4 py-2 text-sm font-semibold border-2 text-gray-700 border-yellow-400 rounded-md bg-gray-200 hover:bg-yellow-400 hover:text-gray-900 ${
                                location === 1 ? "bg-yellow-400 text-white" : ""
                            }`}
                        >
                            AWS1
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                filterData(2);
                                setLocation(2);
                                setLabel("AWS 2 Pending Orders");
                                // setSelectedClient([]);
                            }}
                            className={`px-4 py-2 text-sm font-semibold border-2 border-red-500 rounded-md text-gray-700 bg-gray-200 hover:bg-red-600 hover:text-white ${
                                location === 2 ? "bg-red-500 text-white" : ""
                            }`}
                        >
                            AWS2
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                filterData(7);
                                setLocation(7);
                                setLabel("AWT Pending Orders");
                                // setSelectedClient([]);
                            }}
                            className={`px-4 py-2 text-sm font-semibold border-2 border-blue-800 rounded-md text-gray-700 bg-gray-200 hover:bg-blue-800 hover:text-white ${
                                location === 7 ? "bg-blue-900 text-white" : ""
                            }`}
                        >
                            AWT
                        </button>
                        <button
                            onClick={() => {
                                filterData(8);
                                setLocation(8);
                                setLabel("AWS1 + AWS2 Pending Orders");
                                // setSelectedClient([]);
                            }}
                            type="button"
                            className={`px-4 py-2 text-sm font-semibold border-2 border-yellow-700 rounded-md text-gray-700 bg-gray-200 hover:bg-yellow-700 hover:text-white ${
                                location === 8 ? "bg-yellow-700 text-white" : ""
                            }`}
                        >
                            AWS1, AWS2
                        </button>
                        <label
                            className="font-semibold cursor-pointer"
                            htmlFor="callOff"
                        >
                            @Call Off
                        </label>
                        <input
                            className="cursor-pointer"
                            type="checkbox"
                            name="callOff"
                            checked={callOff}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setCallOff(true);
                                } else setCallOff(false);
                            }}
                            id="callOff"
                        />
                    </div>
                </div>
            </div>

            <div className="w-full h-full">
                {filteredData.length > 0 ? (
                    <h1 className="text-center font-semibold py-2 text-lg">
                        {label}
                    </h1>
                ) : (
                    ""
                )}
                <ReactLoadingTopBar ref={loadingBar} />
                <table
                    ref={tableRef}
                    className="min-w-full divide-y border-2 border-gray-900  relative py-5"
                >
                    <thead
                        className={`${
                            location === 1
                                ? "bg-yellow-500"
                                : location === 2
                                ? "bg-red-500"
                                : location === 7
                                ? "bg-blue-800"
                                : location === 8
                                ? "bg-yellow-700"
                                : "bg-gray-200"
                        }`}
                    >
                        <tr className="border-2 border-[black]">
                            <th
                                scope="col"
                                className=" border-2 border-[black] whitespace-wrap print:m-0 print:px-[5px] py-3 text-center text-xs font-semibold uppercase tracking-wider"
                            >
                                Order No
                            </th>
                            <th
                                scope="col"
                                className="whitespace-wrap print:m-0 print:px-[5px] py-3 text-center text-xs font-semibold border-2 border-[black] uppercase tracking-wider"
                            >
                                Order Date
                            </th>
                            <th
                                scope="col"
                                className="whitespace-wrap print:m-0 print:px-[5px] py-3 text-center text-xs font-semibold border-2 border-[black] uppercase tracking-wider"
                            >
                                Delivery Date
                            </th>
                            <th
                                scope="col"
                                className="whitespace-nowrap print:m-0 print:px-[5px] px-2   py-3 text-center text-xs font-semibold border-2 border-[black]  uppercase tracking-wider"
                            >
                                UID
                            </th>
                            <th
                                scope="col"
                                className="whitespace-nowrap print:m-0 print:px-[5px]  py-3 text-center text-xs font-semibold border-2 border-[black] uppercase tracking-wider"
                            >
                                Articles
                            </th>
                            <th
                                scope="col"
                                className="whitespace-nowrap print:m-0 print:px-[5px]  py-3 text-center text-xs font-semibold border-2 border-[black]  uppercase tracking-wider"
                            >
                                Description
                            </th>

                            <th
                                scope="col"
                                className="whitespace-nowrap print:m-0 print:px-[5px]  py-3 text-center text-xs font-semibold border-2 border-[black] uppercase tracking-wider"
                            >
                                Qty
                            </th>
                            <th
                                scope="col"
                                className="whitespace-nowrap print:m-0 print:px-[5px]  py-3 text-center text-xs font-semibold border-2 border-[black]  uppercase tracking-wider"
                            >
                                Price
                            </th>
                            <th
                                scope="col"
                                className="whitespace-nowrap print:m-0 print:px-[5px]  py-3 text-center text-xs font-semibold border-2 border-[black]  uppercase tracking-wider"
                            >
                                Cust.Ord.No
                            </th>
                            <th
                                scope="col"
                                className="whitespace-nowrap print:m-0 print:px-[5px]  py-3 text-center text-xs font-semibold border-2 border-[black]  uppercase tracking-wider"
                            >
                                Datos
                            </th>
                            {/* <th
                                scope="col"
                                className="whitespace-nowrap print:m-0 print:px-[5px] px-4 py-3 text-center text-xs font-semibold border-2  uppercase tracking-wider"
                            >
                                Location
                            </th> */}
                            <th
                                scope="col"
                                className="whitespace-nowrap print:m-0 print:px-[5px]  py-3 text-center text-xs font-semibold border-2 border-[black]  uppercase tracking-wider"
                            >
                                Observaciones
                            </th>
                        </tr>
                    </thead>
                    {loading || filteredData.length === 0 ? (
                        <tbody>
                            <tr>
                                <td className="text-center text-3xl border-none font-bold absolute top-[200px] left-[570px]">
                                    Data not Available...
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <tbody className="bg-white divide-y  divide-gray-900">
                            {[...new Set(companyCode)]
                                .sort()
                                .map((code, index) => {
                                    const groupData = filteredData.filter(
                                        (res) =>
                                            res.ArtOrd.substring(0, 6) === code
                                    );

                                    const totalQty = groupData.reduce(
                                        (acc, curr) => {
                                            const qty =
                                                curr.PieOrd - curr.EntCli;
                                            return acc + (qty < 0 ? 0 : qty);
                                        },
                                        0
                                    );

                                    return (
                                        <>
                                             {/* {index !== 0 && (
                                                <tr className="bg-transparent h-10"></tr>
                                            )} */}
                                            {groupData.length > 0 && (
                                                <tr className="border-2 border-[black] ">
                                                    <td
                                                        colSpan="11"
                                                        className="font-semibold py-2 px-3"
                                                    >
                                                        {code}
                                                    </td>
                                                </tr>
                                            )}

                                            {groupData.map((userData) => (
                                                <TableData
                                                    key={userData.NumOrd}
                                                    userData={userData}
                                                />
                                            ))}
                                            {groupData.length > 0 && (
                                                <tr className="bg-gray-300 ">
                                                    <td
                                                        colSpan="6"
                                                        className="font-bold text-right border-b-2 border-gray-900"
                                                    >
                                                        Total
                                                    </td>
                                                    <td className="font-bold text-center border-b-2 border-gray-900">
                                                        {totalQty}
                                                    </td>
                                                    <td className="font-bold text-center border-b-2 border-gray-900">
                                                        {calculateGrandTotal(
                                                            groupData,
                                                            clientFilterData
                                                        )}
                                                    </td>
                                                    <td className="border-b-2 border-gray-900" colSpan="5"></td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })}

                            <tr className="bg-gray-800 text-white">
                                <td
                                    colSpan="6"
                                    className="font-bold text-right px-1"
                                >
                                    Grand Total
                                </td>
                                <td className="font-bold text-center px-1">
                                    {grandQty.toLocaleString("en-IN", {
                                        maximumFractionDigits: 2,
                                    })}
                                </td>
                                <td className="font-bold text-center px-1">
                                    {grandValue}
                                </td>
                                <td className="py-5" colSpan="3"></td>
                            </tr>
                        </tbody>
                    )}
                </table>
            </div>
        </div>
    );
}

export default App;
