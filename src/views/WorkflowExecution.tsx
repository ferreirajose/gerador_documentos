import { useState, useEffect } from "react"
import WorkflowOutput from "../components/common/WorkflowOutput"
import { useWorkflow } from "@/context/WorkflowContext";

export default function WorkflowExecution() {
    const { state } = useWorkflow()
  
  const [isWorkflowVisible, setIsWorkflowVisible] = useState(true); // ou false se quiser iniciar oculto

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">

       {/* Output do Workflow - só mostra se houver nós */}
      {state.nodes.length > 0 && (
        <WorkflowOutput
          isWorkflowVisible={isWorkflowVisible}
          setIsWorkflowVisible={setIsWorkflowVisible}
        />
      )}

    </div>
  )
}