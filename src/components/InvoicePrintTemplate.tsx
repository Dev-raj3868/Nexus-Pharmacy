import Logo from "@/components/Logo";
import { format } from "date-fns";

const InvoicePrintTemplate = ({ bill }: any) => {
  const items = bill.items || [];
const config = bill.templateSnapshot?.config || {};

  return (
    <div className="p-6 text-sm text-black bg-white">
      {/* HEADER */}
      <div className="flex justify-between border-b pb-3">
      <div>
  {/* Template / Pharmacy Name */}
  <h1 className="text-xl font-bold">
    {config.templateName || "Clinic / Pharmacy"}
  </h1>

  {/* Address */}
  {config.address?.enabled && (
    <p>{config.address.value}</p>
  )}

  {/* Drug License Numbers */}
  {config.drugLicenseEnabled && (
    <>
      <p>
        <strong>DL No. 1:</strong>{" "}
        {config.dlNumber1?.value || "-"}
      </p>
      <p>
        <strong>DL No. 2:</strong>{" "}
        {config.dlNumber2?.value || "-"}
      </p>
    </>
  )}

  {/* GST */}
  {config.gstEnabled && (
    <p>
      <strong>GSTIN:</strong>{" "}
      {config.gstin?.value || "-"}
    </p>
  )}
  {/* FSSAI */}
{config.fssai?.enabled && (
  <p>
    <strong>FSSAI:</strong>{" "}
    {config.fssai.value || "-"}
  </p>
)}

</div>


        <div className="text-right">
         
  {bill.templateSnapshot?.config?.logo?.dataUrl ? (
    <img
      src={bill.templateSnapshot.config.logo.dataUrl}
      alt="Pharmacy Logo"
      className="h-14 ml-auto mb-2 object-contain"
    />
  ) : (
    <Logo />
  )}

  <p className="mt-1 font-semibold">Sales Invoice</p>
  <p><strong>Invoice No:</strong> {bill.billNumber}</p>
  <p><strong>Date:</strong> {format(new Date(bill.billDate), "dd/MM/yyyy")}</p>
</div>

      </div>

      {/* PATIENT INFO */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p><strong>Patient Name:</strong> {bill.patientName}</p>
          <p><strong>Contact No:</strong> {bill.patientPhone || "-"}</p>
        </div>
        <div>
          <p><strong>Doctor Name:</strong> {bill.doctorName || "-"}</p>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <table className="w-full border mt-4 text-xs">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-1">S.No</th>
            <th className="border p-1">Description</th>
            <th className="border p-1">HSN</th>
            <th className="border p-1">Batch</th>
            <th className="border p-1">Exp</th>
            <th className="border p-1">Qty</th>
            <th className="border p-1">MRP</th>
            <th className="border p-1">Rate</th>
            <th className="border p-1">Disc%</th>
            <th className="border p-1">Taxable</th>
            <th className="border p-1">CGST</th>
            <th className="border p-1">SGST</th>
          </tr>
        </thead>

     <tbody>
  {items.length > 0 ? (
    items.map((item: any, i: number) => (
      <tr key={item.id || i}>
        <td className="border p-1 text-center">{i + 1}</td>
        <td className="border p-1">{item.itemName}</td>
        <td className="border p-1">-</td>
        <td className="border p-1">-</td>
        <td className="border p-1">-</td>
        <td className="border p-1 text-center">{item.quantity}</td>
        <td className="border p-1 text-right">{item.price}</td>
        <td className="border p-1 text-right">{item.price}</td>
        <td className="border p-1 text-center">0%</td>
        <td className="border p-1 text-right">{item.total}</td>
        <td className="border p-1 text-right">0</td>
        <td className="border p-1 text-right">0</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={12} className="border p-2 text-center text-gray-400">
        No items found
      </td>
    </tr>
  )}
</tbody>

      </table>

      {/* TOTALS */}
      <div className="flex justify-end mt-4">
        <div className="w-1/3 text-sm">
          <p className="flex justify-between">
            <span>Round Off:</span>
            <span>{bill.roundOff || "0.00"}</span>
          </p>
          <p className="flex justify-between font-bold border-t mt-2 pt-2">
            <span>Grand Total:</span>
            <span>₹ {bill.totalAmount.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between mt-10">
        <p className="text-xs">* Medicines once sold cannot be returned</p>
      <div className="text-center">
  {bill.templateSnapshot.config.signature.dataUrl && (
    <img
      src={bill.templateSnapshot.config.signature.dataUrl}
      alt="Signature"
      className="h-12 mx-auto mb-1"
    />
  )}
  <div className="border-t w-40 mx-auto" />
  <p className="text-xs">Authorised Signature</p>
</div>

      </div>
    </div>
  );
};

export default InvoicePrintTemplate;
