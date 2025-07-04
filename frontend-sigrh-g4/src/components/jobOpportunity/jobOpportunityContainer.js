"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import Cookies from "js-cookie";
import config from "@/config";
import axios from "axios";
import JobOpportunityFormData from "./jobOpportunityFormData";
import PostulationsContainer from "../postulationsResults/postulationsContainer";
import { toastAlerts } from "@/utils/toastAlerts";

export default function JobOpportunityContainer({ jobOpportunityId }) {
  const [opportunityData, setOpportunityData] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Detalles", "Postulaciones"];

  const token = Cookies.get("token");
  const router = useRouter();

  const fetchOpportunityData = async () => {
    try {
      const res = await axios.get(
        `${config.API_URL}/opportunities/${jobOpportunityId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status != 200) throw new Error("Error al traer los empleados");

      setOpportunityData(res.data);
    } catch (e) {
      console.error(e);
      toastAlerts.showError(
        "Hubo un error al obtener la convocatoria, recargue la página e intente nuevamente"
      );
    }
  };

  useEffect(() => {
    fetchOpportunityData();
  }, []);

  const handleSaveJobOpportunityForm = async (jobOpportunityNewData, id) => {
    try {
      const payload = {
        owner_employee_id: opportunityData.owner_employee_id,
        status: jobOpportunityNewData.status || "activo",
        work_mode: jobOpportunityNewData.work_mode.toLowerCase() || "remoto",
        title: jobOpportunityNewData.title || "",
        description: jobOpportunityNewData.description || "",
        budget: jobOpportunityNewData.budget || 1,
        budget_currency_id: jobOpportunityNewData.budget_currency_id || "USD",
        state_id: jobOpportunityNewData.state_id || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        required_abilities: (
          jobOpportunityNewData.required_abilities || []
        ).map((ability) => ({
          name: ability.name || "",
          description: ability.description || "",
          id: ability.id || 0,
        })),
        desirable_abilities: (
          jobOpportunityNewData.desirable_abilities || []
        ).map((ability) => ({
          name: ability.name || "",
          description: ability.description || "",
          id: ability.id || 0,
        })),
        required_skill_percentage:
          jobOpportunityNewData.requiredPercentage || 0,
        desirable_skill_percentage:
          jobOpportunityNewData.desirablePercentage || 0,
      };

      const res = await axios.patch(
        `${config.API_URL}/opportunities/${id}`,
        JSON.stringify(payload),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status !== 200)
        throw new Error("Error al modificar la convocatoria");

      setOpportunityData(res.data);
    } catch (e) {
      console.error(e);
      toastAlerts.showError(
        "Hubo un error al guardar la convocatoria, recargue la página e intente nuevamente"
      );
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-black">
        <IoMdArrowRoundBack
          onClick={() => router.push("/sigrh/job_opportunities")}
          className="cursor-pointer text-black"
        />
        <h1 className="text-2xl font-semibold">
          Convocatoria /{" "}
          {jobOpportunityId == "new" ? "Nuevo" : `# ${jobOpportunityId}`} 💼
        </h1>
      </div>

      <div className="mt-4">
        <div className="flex space-x-4 border-b border-gray-300">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => {
                if (jobOpportunityId == "new" && index != 0) {
                  toastAlerts.showError(
                    "Debe completar los detalles de la convocatoria antes de ver las postulaciones"
                  );
                  return;
                }
                setActiveTab(index);
              }}
              className={`py-2 px-4 text-sm font-semibold rounded-t-md ${
                activeTab === index
                  ? "border-b-2 border-emerald-500 text-emerald-500"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div className="h-[70vh] overflow-y-auto">
            <JobOpportunityFormData
              jobOpportunity={opportunityData}
              onSave={handleSaveJobOpportunityForm}
              onClose={() => {}}
            />
          </div>
        )}

        {activeTab === 1 && (
          <div className="h-[70vh] overflow-y-auto">
            <PostulationsContainer jobOpportunityId={opportunityData.id} />
          </div>
        )}
      </div>
    </div>
  );
}
