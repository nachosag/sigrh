const SelectActiveChip = ({ value, onChange }) => {
  const getColorClass = (val) => {
    switch (val) {
      case "activo":
        return "flex justify-center rounded-full px-3 py-1 text-sm font-semibold border bg-green-200 text-green-600";
      case "inactivo":
        return "flex justify-center rounded-full px-3 py-1 text-sm font-semibold border bg-red-200 text-red-600";
      default:
        return "flex justify-center rounded-full px-3 py-1 text-sm font-semibold border bg-gray-200 text-gray-600";
    }
  };

  return (
    <select
      value={value}
      onChange={onChange}
      className={`rounded-full px-3 py-1 text-sm font-semibold border ${getColorClass(
        value
      )} focus:outline-none`}
    >
      <option value="activo" className="bg-white text-black">
        Activo
      </option>
      <option value="inactivo" className="bg-white text-black">
        Inactivo
      </option>
    </select>
  );
};

export default SelectActiveChip;
