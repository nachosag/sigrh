const SelectPayrollStatusChip = ({ value, rowId, onChange }) => {
  const getColorClass = (val) => {
    switch (val) {
      case "payable":
        return "bg-green-200 text-green-600";
      case "not payable":
        return "bg-red-200 text-red-600";
      case "archived":
        return "bg-yellow-200 text-yellow-600";
      case "pending validation":
        return "bg-cyan-200 text-cyan-600";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(rowId, e.target.value)}
      className={`rounded-full px-3 text-xs font-semibold border ${getColorClass(
        value
      )} focus:outline-none`}
    >
      <option value="payable" className="bg-white text-black">
        Pagable
      </option>
      <option value="not payable" className="bg-white text-black">
        No imputable
      </option>
      <option value="archived" className="bg-white text-black">
        Archivado
      </option>
      <option value="pending validation" className="bg-white text-black">
        En validación
      </option>
    </select>
  );
};

export default SelectPayrollStatusChip;