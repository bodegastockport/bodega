import { useState } from "react";

const individualSections = [
  {
    title: "1. Introduction",
    body: [
      "1.1 The Cellar Club is a wine storage membership operated by Bodega (\u201cBodega\u201d, \u201cthe Company\u201d, \u201cwe\u201d, \u201cus\u201d or \u201cour\u201d).",
      "1.2 By applying for and maintaining a Cellar Club Membership, you (\u201cthe Member\u201d) agree to be bound by these Terms & Conditions.",
    ],
  },
  {
    title: "2. Membership",
    body: [
      "2.1 Membership is personal to the named Member and may not be transferred, assigned or shared with any other person.",
      "2.2 Membership commences when the Member's application has been accepted and the applicable Membership fee has been paid.",
      "2.3 The Company reserves the right to refuse, suspend or terminate Membership where it reasonably believes that a Member has breached these Terms & Conditions.",
    ],
  },
  {
    title: "3. Wine Storage",
    body: [
      "3.1 Members may store wine up to the storage capacity included within their Membership tier.",
      "3.2 All wine deposited with the Company remains the property of the Member at all times.",
      "3.3 Members are responsible for ensuring that all wine deposited with the Company has been legally acquired and may lawfully be stored.",
      "3.4 Wine may only be deposited by prior appointment and during such drop-off times as the Company may specify from time to time.",
      "3.5 Wine intended for consumption at Bodega must be deposited with the Company at least 24 hours prior to the intended date of consumption. Wine may not be brought onto the premises or deposited on the same day that it is intended to be consumed.",
      "3.6 Wine must be stored in its original unopened bottle.",
      "3.7 The Company reserves the right to refuse storage of any wine that is damaged, leaking, counterfeit, unsafe or otherwise unsuitable for storage.",
      "3.8 The Company reserves the right to relocate stored wine to an alternative secure storage location under its control where reasonably necessary for operational, maintenance, security, emergency or business continuity reasons.",
    ],
  },
  {
    title: "4. Identity Verification",
    body: [
      "4.1 The Company reserves the right to request photographic identification from the Member at any time.",
      "4.2 Acceptable forms of identification may include a passport, driving licence or any other form of identification reasonably approved by the Company.",
      "4.3 Failure to provide satisfactory identification may result in the Company refusing access to stored wine or Membership benefits.",
    ],
  },
  {
    title: "5. Depositing and Withdrawing Wine",
    body: [
      "5.1 Wine may only be deposited by the Member personally.",
      "5.2 The Member must be physically present when wine is deposited into storage.",
      "5.3 Wine may only be requested, withdrawn or consumed by the Member.",
      "5.4 The Member must be physically present when wine is removed from storage.",
      "5.5 The Company reserves the right to refuse release of wine where it is not satisfied as to the identity of the Member.",
    ],
  },
  {
    title: "6. Accessing Your Wine",
    body: [
      "6.1 Members may only consume stored wine on the premises during licensed trading hours.",
      "6.2 Corkage charges may apply and shall be charged at the prevailing rate published by Bodega from time to time.",
    ],
  },
  {
    title: "7. Inventory Records",
    body: [
      "7.1 The Company may maintain a digital inventory of wine stored on behalf of Members.",
      "7.2 The Company's inventory records shall be deemed conclusive evidence of the quantity and identity of wine held on behalf of the Member unless the Member can demonstrate a manifest error.",
    ],
  },
  {
    title: "8. Storage Conditions",
    body: [
      "8.1 The Company will take reasonable steps to maintain appropriate temperature and humidity conditions within the wine vault.",
      "8.2 Storage conditions may vary from time to time due to maintenance, power outages, equipment failure or circumstances beyond the Company's reasonable control.",
      "8.3 The Company does not guarantee the condition, quality, maturity, drinkability or future value of any wine stored by a Member.",
    ],
  },
  {
    title: "9. Liability and Insurance",
    body: [
      "9.1 The Company shall exercise reasonable care in handling and storing Members' wine.",
      "9.2 The Company's total liability for any loss of or damage to a Member's wine or other goods, however caused (including by the Company's negligence), shall be limited to:",
      "\u2022 a maximum of £20 per bottle; and",
      "\u2022 a maximum of £250 per claim and £500 per Membership in any rolling 12-month period.",
      "9.3 The Company shall not be liable for any indirect, special or consequential loss, including but not limited to loss of profits, loss of business, loss of opportunity, loss of goodwill, loss of anticipated savings or any reduction in the value of wine.",
      "9.4 The Company shall not be liable for natural cork failure, seepage, oxidation, deterioration arising from age or inherent characteristics of the wine, manufacturing defects, changes in market value or circumstances beyond the Company's reasonable control.",
      "9.5 Members are solely responsible for arranging and maintaining insurance cover for the full value of any wine or goods stored with the Company.",
      "9.6 By accepting these Terms & Conditions, the Member acknowledges that they have been advised to obtain appropriate insurance cover and accepts that the Company's liability is limited as set out in this clause.",
    ],
  },
  {
    title: "10. Membership Fees",
    body: [
      "10.1 Membership fees are payable in advance and are non-refundable except where required by law.",
      "10.2 The Company may amend Membership fees by providing not less than 30 days' notice to Members.",
      "10.3 Failure to maintain payment may result in suspension or termination of Membership.",
    ],
  },
  {
    title: "11. Termination",
    body: [
      "11.1 Members may cancel their Membership at any time by providing 30 days' written notice.",
      "11.2 Upon cancellation or termination of Membership, Members must arrange collection of all stored wine within 30 days.",
      "11.3 Prior to exercising any right to sell or dispose of uncollected wine, the Company shall use reasonable endeavours to contact the Member using the most recent contact details provided.",
      "11.4 The Company reserves the right to charge additional storage fees for wine remaining after the collection period.",
      "11.5 Wine not collected within 12 months of termination may be treated as abandoned property and may be sold, disposed of or otherwise dealt with by the Company in order to recover any outstanding sums owed.",
    ],
  },
  {
    title: "12. Licensing Compliance",
    body: [
      "12.1 Members must comply with all licensing laws and any reasonable instructions given by Bodega staff.",
      "12.2 The Company reserves the right to refuse service where required by law, including where a person is intoxicated, underage or otherwise prohibited from being served alcohol.",
      "12.3 Membership does not guarantee access to alcohol and does not exempt Members from any licensing requirements or restrictions.",
    ],
  },
  {
    title: "13. Data Protection",
    body: [
      "13.1 The Company will process Members' personal information in accordance with its Privacy Policy.",
    ],
  },
  {
    title: "14. Amendments",
    body: [
      "14.1 The Company reserves the right to amend these Terms & Conditions from time to time by providing reasonable notice to Members.",
    ],
  },
  {
    title: "15. Governing Law",
    body: [
      "15.1 These Terms & Conditions shall be governed by and construed in accordance with the laws of England and Wales.",
      "15.2 Any dispute arising in connection with these Terms & Conditions shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
    ],
  },
];

const individualDeclaration = {
  title: "Member Declaration",
  intro: "By proceeding with a Cellar Club Membership, I confirm that:",
  bullets: [
    "I am aged 18 or over.",
    "All wine deposited with Bodega has been legally acquired and remains my property.",
    "I acknowledge that Bodega's liability for loss of or damage to my wine is limited to £20 per bottle, £250 per claim and £500 per Membership in any rolling 12-month period.",
    "I have been advised to obtain appropriate insurance cover for the full value of my collection.",
    "I agree to be bound by these Terms & Conditions.",
  ],
};

const corporateSections = [
  {
    title: "1. Introduction",
    body: [
      "1.1 The Cellar Club is a wine storage membership operated by Bodega (\u201cBodega\u201d, \u201cthe Company\u201d, \u201cwe\u201d, \u201cus\u201d or \u201cour\u201d).",
      "1.2 By applying for and maintaining a Corporate Cellar Club Membership, the Corporate Member agrees to be bound by these Terms & Conditions.",
      "1.3 The Corporate Member shall ensure that all Authorised Users comply with these Terms & Conditions.",
    ],
  },
  {
    title: "2. Corporate Membership",
    body: [
      "2.1 A Corporate Membership may be held by a company, partnership, LLP or other organisation approved by the Company (\u201cCorporate Member\u201d).",
      "2.2 The Corporate Member shall appoint a primary contact (\u201cMembership Administrator\u201d) responsible for administering the Membership.",
      "2.3 Membership commences when the Corporate Member's application has been accepted and the applicable Membership fee has been paid.",
      "2.4 The Company reserves the right to refuse, suspend or terminate Membership where it reasonably believes that the Corporate Member or any Authorised User has breached these Terms & Conditions.",
    ],
  },
  {
    title: "3. Authorised Users",
    body: [
      "3.1 The Corporate Member may nominate Authorised Users in accordance with its Membership tier.",
      "3.2 Only Authorised Users recorded on the Company's systems may deposit, access, request, withdraw or consume wine under the Membership.",
      "3.3 The maximum number of Authorised Users permitted under each Membership tier shall be:",
      "\u2022 Corporate 6 \u2013 1 Authorised User",
      "\u2022 Corporate 12 \u2013 2 Authorised Users",
      "\u2022 Corporate 18 \u2013 3 Authorised Users",
      "\u2022 Corporate 24 \u2013 4 Authorised Users",
      "3.4 Each Authorised User must provide a valid company email address associated with the Corporate Member.",
      "3.5 The Corporate Member shall ensure that its list of Authorised Users remains accurate and up to date at all times.",
      "3.6 The Corporate Member may add or remove Authorised Users by written notice to the Company.",
      "3.7 Changes to Authorised Users shall only take effect once confirmed by the Company.",
      "3.8 The Company reserves the right to refuse any proposed Authorised User where it reasonably believes that the individual is not connected with the Corporate Member.",
    ],
  },
  {
    title: "4. Wine Storage",
    body: [
      "4.1 Members may store wine up to the storage capacity included within their Membership tier.",
      "4.2 All wine deposited with the Company remains the property of the Corporate Member unless otherwise recorded by the Company.",
      "4.3 The Corporate Member is responsible for ensuring that all wine deposited with the Company has been legally acquired and may lawfully be stored.",
      "4.4 Wine may only be deposited by prior appointment and during such drop-off times as the Company may specify from time to time.",
      "4.5 Wine intended for consumption at Bodega must be deposited with the Company at least 24 hours prior to the intended date of consumption. Wine may not be brought onto the premises or deposited on the same day that it is intended to be consumed.",
      "4.6 Wine must be stored in its original unopened bottle.",
      "4.7 The Company reserves the right to refuse storage of any wine that is damaged, leaking, counterfeit, unsafe or otherwise unsuitable for storage.",
      "4.8 The Company reserves the right to relocate stored wine to an alternative secure storage location under its control where reasonably necessary for operational, maintenance, security, emergency or business continuity reasons.",
    ],
  },
  {
    title: "5. Identity Verification",
    body: [
      "5.1 The Company reserves the right to request photographic identification from any Authorised User at any time.",
      "5.2 Acceptable forms of identification may include a passport, driving licence or any other form of identification reasonably approved by the Company.",
      "5.3 Failure to provide satisfactory identification may result in the Company refusing access to stored wine or Membership benefits.",
    ],
  },
  {
    title: "6. Depositing and Withdrawing Wine",
    body: [
      "6.1 Wine may only be deposited by an Authorised User.",
      "6.2 An Authorised User must be physically present when wine is deposited into storage.",
      "6.3 Wine may only be requested, withdrawn or consumed by an Authorised User.",
      "6.4 An Authorised User must be physically present when wine is removed from storage.",
      "6.5 The Company reserves the right to refuse release of wine where it is not satisfied that an individual is an Authorised User.",
      "6.6 The Company shall not be liable for any loss arising from inaccurate, incomplete or outdated Authorised User information supplied by the Corporate Member.",
    ],
  },
  {
    title: "7. Accessing Your Wine",
    body: [
      "7.1 Authorised Users may only consume stored wine on the premises during licensed trading hours.",
      "7.2 Corkage charges may apply and shall be charged at the prevailing rate published by Bodega from time to time.",
    ],
  },
  {
    title: "8. Inventory Records",
    body: [
      "8.1 The Company may maintain a digital inventory of wine stored on behalf of the Corporate Member.",
      "8.2 The Company's inventory records shall be deemed conclusive evidence of the quantity and identity of wine held on behalf of the Corporate Member unless the Corporate Member can demonstrate a manifest error.",
    ],
  },
  {
    title: "9. Storage Conditions",
    body: [
      "9.1 The Company will take reasonable steps to maintain appropriate temperature and humidity conditions within the wine vault.",
      "9.2 Storage conditions may vary from time to time due to maintenance, power outages, equipment failure or circumstances beyond the Company's reasonable control.",
      "9.3 The Company does not guarantee the condition, quality, maturity, drinkability or future value of any wine stored by the Corporate Member.",
    ],
  },
  {
    title: "10. Liability and Insurance",
    body: [
      "10.1 The Company shall exercise reasonable care in handling and storing Members' wine.",
      "10.2 The Company's total liability for any loss of or damage to a Corporate Member's wine or other goods, however caused (including by the Company's negligence), shall be limited to:",
      "\u2022 a maximum of £20 per bottle; and",
      "\u2022 a maximum of £250 per claim and £500 per Membership in any rolling 12-month period.",
      "10.3 The Company shall not be liable for any indirect, special or consequential loss, including but not limited to loss of profits, loss of business, loss of opportunity, loss of goodwill, loss of anticipated savings or any reduction in the value of wine.",
      "10.4 The Company shall not be liable for natural cork failure, seepage, oxidation, deterioration arising from age or inherent characteristics of the wine, manufacturing defects, changes in market value or circumstances beyond the Company's reasonable control.",
      "10.5 The Corporate Member is solely responsible for arranging and maintaining insurance cover for the full value of any wine or goods stored with the Company.",
      "10.6 By accepting these Terms & Conditions, the Corporate Member acknowledges that it has been advised to obtain appropriate insurance cover and accepts that the Company's liability is limited as set out in this clause.",
    ],
  },
  {
    title: "11. Membership Fees",
    body: [
      "11.1 Membership fees are payable in advance and are non-refundable except where required by law.",
      "11.2 The Company may amend Membership fees by providing not less than 30 days' notice to Members.",
      "11.3 Failure to maintain payment may result in suspension or termination of Membership.",
    ],
  },
  {
    title: "12. Termination",
    body: [
      "12.1 The Corporate Member may cancel its Membership at any time by providing 30 days' written notice.",
      "12.2 Upon cancellation or termination of Membership, the Corporate Member must arrange collection of all stored wine within 30 days.",
      "12.3 Prior to exercising any right to sell or dispose of uncollected wine, the Company shall use reasonable endeavours to contact the Corporate Member using the most recent contact details provided.",
      "12.4 The Company reserves the right to charge additional storage fees for wine remaining after the collection period.",
      "12.5 Wine not collected within 12 months of termination may be treated as abandoned property and may be sold, disposed of or otherwise dealt with by the Company in order to recover any outstanding sums owed.",
    ],
  },
  {
    title: "13. Licensing Compliance",
    body: [
      "13.1 The Corporate Member and all Authorised Users must comply with all licensing laws and any reasonable instructions given by Bodega staff.",
      "13.2 The Company reserves the right to refuse service where required by law, including where a person is intoxicated, underage or otherwise prohibited from being served alcohol.",
      "13.3 Membership does not guarantee access to alcohol and does not exempt the Corporate Member or any Authorised User from licensing requirements or restrictions.",
    ],
  },
  {
    title: "14. Data Protection",
    body: [
      "14.1 The Company will process personal information in accordance with its Privacy Policy.",
      "14.2 The Corporate Member confirms that it has authority to provide the personal data of Authorised Users to the Company for the purposes of administering the Membership.",
    ],
  },
  {
    title: "15. Amendments",
    body: [
      "15.1 The Company reserves the right to amend these Terms & Conditions from time to time by providing reasonable notice to Members.",
    ],
  },
  {
    title: "16. Governing Law",
    body: [
      "16.1 These Terms & Conditions shall be governed by and construed in accordance with the laws of England and Wales.",
      "16.2 Any dispute arising in connection with these Terms & Conditions shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
    ],
  },
];

const corporateDeclaration = {
  title: "Corporate Declaration",
  intro: "By proceeding with a Corporate Cellar Club Membership, the Corporate Member confirms that:",
  bullets: [
    "It has authority to enter into these Terms & Conditions.",
    "All wine deposited with Bodega has been legally acquired and remains the property of the Corporate Member unless otherwise recorded by Bodega.",
    "It acknowledges that Bodega's liability for loss of or damage to wine is limited to £20 per bottle, £250 per claim and £500 per Membership in any rolling 12-month period.",
    "It has been advised to obtain appropriate insurance cover for the full value of its collection.",
    "It agrees to be bound by these Terms & Conditions and shall ensure that all Authorised Users comply with them.",
  ],
};

const renderBody = (lines) => {
  const blocks = [];
  let currentBullets = null;

  lines.forEach((line, i) => {
    if (line.startsWith("\u2022")) {
      if (!currentBullets) {
        currentBullets = [];
        blocks.push({ type: "ul", items: currentBullets });
      }
      currentBullets.push(line.replace(/^\u2022\s*/, ""));
    } else {
      currentBullets = null;
      blocks.push({ type: "p", text: line, key: i });
    }
  });

  return blocks.map((block, i) => {
    if (block.type === "ul") {
      return (
        <ul key={`ul-${i}`} style={{ margin: "0 0 8px 0", paddingLeft: "18px" }}>
          {block.items.map((item, j) => (
            <li key={j} className="text-sm leading-relaxed" style={{ color: "#0A242C", marginBottom: "4px" }}>
              {item}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={`p-${i}`} className="text-sm leading-relaxed" style={{ color: "#0A242C", marginBottom: "8px" }}>
        {block.text}
      </p>
    );
  });
};

export default function CellarClubTerms() {
  const initialTab = (() => {
    if (typeof window === "undefined") return "individual";
    const params = new URLSearchParams(window.location.search);
    return params.get("type") === "corporate" ? "corporate" : "individual";
  })();

  const [activeTab, setActiveTab] = useState(initialTab);

  const sections = activeTab === "corporate" ? corporateSections : individualSections;
  const declaration = activeTab === "corporate" ? corporateDeclaration : individualDeclaration;

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
        <h1 className="text-2xl mb-2" style={{ color: "#1E4D5A", fontWeight: 400 }}>Cellar Club Terms & Conditions</h1>
        <p className="text-xs mb-8" style={{ color: "#0A242C", opacity: 0.5 }}>Last updated: June 2026</p>

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

        {sections.map(({ title, body }) => (
          <div key={title} style={{ marginBottom: "32px" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#1E4D5A" }}>{title}</p>
            {renderBody(body)}
          </div>
        ))}

        <div style={{ marginBottom: "32px", paddingTop: "24px", borderTop: "1px solid #d8d6d0" }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#1E4D5A" }}>{declaration.title}</p>
          <p className="text-sm leading-relaxed mb-2" style={{ color: "#0A242C" }}>{declaration.intro}</p>
          <ul style={{ margin: "0 0 8px 0", paddingLeft: "18px" }}>
            {declaration.bullets.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed" style={{ color: "#0A242C", marginBottom: "4px" }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ borderTop: "1px solid #d8d6d0", paddingTop: "24px", marginTop: "24px" }}>
          <p className="text-xs" style={{ color: "#0A242C", opacity: 0.6 }}>
            For any questions about these terms, please contact us at{" "}
            <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#1E4D5A" }}>hello@bodegawine.co.uk</a>.
          </p>
        </div>

        <div style={{ marginTop: "32px" }}>
          <a href="/cellar-club" style={{ fontSize: "11px", color: "#0A242C", opacity: 0.6, textDecoration: "none", borderBottom: "1px solid #d8d6d0", paddingBottom: "1px" }}>
            ← Back to Cellar Club
          </a>
        </div>
      </div>
    </div>
  );
}