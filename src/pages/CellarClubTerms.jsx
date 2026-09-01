import { useState } from "react";
import { individualVersions, LATEST_INDIVIDUAL_VERSION, corporateVersions, LATEST_CORPORATE_VERSION } from "@/lib/cellarClubTerms";
import CellarClubTermsBody from "@/components/CellarClubTermsBody";

export default function CellarClubTerms() {
  const initial = (() => {
    if (typeof window === "undefined") return { type: "individual", version: LATEST_INDIVIDUAL_VERSION };
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") === "corporate" ? "corporate" : "individual";
    const requestedVersion = params.get("version");

    if (type === "corporate") {
      const version = requestedVersion && corporateVersions[requestedVersion] ? requestedVersion : LATEST_CORPORATE_VERSION;
      return { type, version };
    }

    const version = requestedVersion && individualVersions[requestedVersion] ? requestedVersion : LATEST_INDIVIDUAL_VERSION;
    return { type, version };
  })();

  const [activeTab, setActiveTab] = useState(initial.type);
  const [version] = useState(initial.version);

  const isIndividual = activeTab === "individual";

  const individualContent = individualVersions[version] || individualVersions[LATEST_INDIVIDUAL_VERSION];
  const corporateContent = corporateVersions[version] || corporateVersions[LATEST_CORPORATE_VERSION];

  const sections = isIndividual ? individualContent.sections : corporateContent.sections;
  const declaration = isIndividual ? individualContent.declaration : corporateContent.declaration;
  const updatedLabel = isIndividual ? individualContent.label : corporateContent.label;

  const tabBase = {
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "9px 24px",
    cursor: "pointer",
    border: "1px solid #0A242C",
  };

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 36px" }}>

        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C", opacity: 0.5 }}>Bodega Wine Bar</p>
        <h1 className="text-2xl mb-8" style={{ color: "#1E4D5A", fontWeight: 400 }}>Cellar Club Terms & Conditions</h1>

        <div className="flex items-center" style={{ marginBottom: "40px" }}>
          <button
            onClick={() => setActiveTab("individual")}
            style={{
              ...tabBase,
              backgroundColor: activeTab === "individual" ? "#1E4D5A" : "transparent",
              color: activeTab === "individual" ? "#f3f2ee" : "#0A242C",
              borderRight: "none",
            }}
          >
            Individual
          </button>
          <button
            onClick={() => setActiveTab("corporate")}
            style={{
              ...tabBase,
              backgroundColor: activeTab === "corporate" ? "#1E4D5A" : "transparent",
              color: activeTab === "corporate" ? "#f3f2ee" : "#0A242C",
            }}
          >
            Corporate
          </button>
        </div>

        <CellarClubTermsBody sections={sections} declaration={declaration} updatedLabel={updatedLabel} />

        <div style={{ marginTop: "32px" }}>
          <a href="/cellar-club" style={{ fontSize: "11px", color: "#0A242C", opacity: 0.6, textDecoration: "none", borderBottom: "1px solid #d8d6d0", paddingBottom: "1px" }}>
            ← Back to Cellar Club
          </a>
        </div>
      </div>
    </div>
  );
}