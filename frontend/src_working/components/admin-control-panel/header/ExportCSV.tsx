import React from "react";
import { Button } from "../../shared/Button.js";
import { Download } from "lucide-react";


export default function ExportCSV({

}){
    const handleExportCSV = async () => {
      console.log("need to implement export")
    }

    return(
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button
              key="export-csv"
              onClick={handleExportCSV}
              variant="outline"
              className="border-green-400/30 text-green-400 hover:bg-green-400/20 hover:text-green-300 text-sm px-3 py-2 sm:px-4 sm:py-2"
            >
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              Export CSV
            </Button>
        </div>
    );
}