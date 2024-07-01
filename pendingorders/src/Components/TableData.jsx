import PropTypes from 'prop-types';

function TableData({ userData }) {
    const { PinOrd, NumOrd,FecPed, ArtOrd, LanOrd, PieOrd, PreOrd, PlaOrd, Datos, EntOrd, EntCli, Observaciones, PedPed } = userData;

    const orderDate = new Date(FecPed).toLocaleDateString('en-US', {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
}).replace(/(\d+)\/(\d+)\/(\d+)/, "$2/$1/$3");

    const deliveryDate = new Date(EntOrd).toLocaleDateString('en-US', {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).replace(/(\d+)\/(\d+)\/(\d+)/, "$2/$1/$3");

    let qty = parseInt(PieOrd) - parseInt(EntCli);
    qty = qty < 0 ? 0 : qty; // Ensure qty is not negative

    return (
        <tr className="text-center">
            <td className="print:m-0 border-[1px] border-gray-900 print:p-0 text-wrap print:text-wrap">{PinOrd}</td>
            <td className="print:m-0 border-[1px] px-1 border-gray-900 print:text-xs print:px-1 whitespace-nowrap  ">{orderDate}</td>
            <td className="print:m-0 border-[1px] px-1 border-gray-900 print:text-xs print:px-1 text-wrap print:text-wrap">{deliveryDate}</td>
            <td className="print:m-0 border-[1px] px-2 border-gray-900 print:text-xl print:p-0 print:px-2 text-wrap print:text-wrap">{NumOrd}</td>
            <td className="print:m-0 border-[1px] px-2 border-gray-900 print:p-0 print:px-1 text-wrap print:text-wrap">{ArtOrd}</td>
            <td className="print:m-0 border-[1px] border-gray-900 print:p-0 text-wrap print:text-wrap whitespace-wrap print:whitespace-wrap ">{`DIE ${PlaOrd}`}</td>
            <td className="print:m-0 border-[1px] border-gray-900 print:p-0 text-wrap print:text-wrap">{qty}</td>
            <td className="print:m-0 border-[1px] border-gray-900 print:p-0 text-wrap print:text-wrap">{PreOrd}</td>
            <td className="print:m-0 border-[1px] border-gray-900 print:px-0  text-wrap print:text-wrap">{PedPed}</td>
            <td className="pprint:m-0 border-[1px] border-gray-900 print:p-0  text-wrap print:text-wrap">{Datos}</td>
            <td className="print:m-0 border-[1px] border-gray-900 print:p-0  text-wrap print:text-wrap">{Observaciones}</td>
        </tr>
    );
}

TableData.propTypes = {
    userData: PropTypes.object.isRequired, // Assuming userData is an object, adjust as needed
};

export default TableData;
