import EmployeeContainer from "@/components/employee/EmployeeContainer";

export default async function EmployeeIdPage({ params }) {
  const { id } = await params;

  return (
    <EmployeeContainer id={id} />
  );
}
