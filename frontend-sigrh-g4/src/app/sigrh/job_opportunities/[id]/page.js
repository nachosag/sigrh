import JobOpportunityContainer from "@/components/jobOpportunity/jobOpportunityContainer";

export default async function VacanciesPage({ params }) {
  const { id } = await params;

  return (
    <div>
      <JobOpportunityContainer jobOpportunityId={id} />
    </div>
  );
}
