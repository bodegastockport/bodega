import { useState } from "react";

const individualSections = [
  {
    title: "1. Introduction",
    paragraphs: [
      "1.1 The Cellar Club is a wine storage membership operated by Bodega (“Bodega”, “the Company”, “we”, “us” or “our”).",
      "1.2 By applying for and maintaining a Cellar Club Membership, you (“the Member”) agree to be bound by these Terms & Conditions.",
    ],
  },
  {
    title: "2. Membership",
    paragraphs: [
      "2.1 Membership is personal to the named Member and may not be transferred, assigned or shared with any other person.",
      "2.2 Membership commences when the Member’s application has been accepted and the applicable Membership fee has been paid.",
      "2.3 The Company reserves the right to refuse, suspend or terminate Membership where it reasonably believes that a Member has breached these Terms & Conditions.",
    ],
  },
  {
    title: "3. Wine Storage",
    paragraphs: [
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
    paragraphs: [
      "4.1 The Company reserves the right to request photographic identification from the Member at any time.",
      "4.2 Acceptable forms of identification may include a passport, driving licence or any other form of identification reasonably approved by the Company.",
      "4.3 Failure to provide satisfactory identification may result in the Company refusing access to stored wine or Membership benefits.",
    ],
  },
  {
    title: "5. Depositing and Withdrawing Wine",
    paragraphs: [
      "5.1 Wine may only be deposited by the Member personally.",
      "5.2 The Member must be physically present when wine is deposited into storage.",
      "5.3 Wine may only be requested, withdrawn or consumed by the Member.",
      "5.4 The Member must be physically present when wine is removed from storage.",
      "5.5 The Company reserves the right to refuse release of wine where it is not satisfied as to the identity of the Member.",
    ],
  },
  {
    title: "6. Accessing Your Wine",
    paragraphs: [
      "6.1 Members may only consume stored wine on the premises during licensed trading hours.",
      "6.2 Corkage charges may apply and shall be charged at the prevailing rate published by Bodega from time to time.",
    ],
  },
  {
    title: "7. Inventory Records",
    paragraphs: [
      "7.1 The Company may maintain a digital inventory of wine stored on behalf of Members.",
      "7.2 The Company’s inventory records shall be deemed conclusive evidence of the quantity and identity of wine held on behalf of the Member unless the Member can demonstrate a manifest error.",
    ],
  },
  {
    title: "8. Storage Conditions",
    paragraphs: [
      "8.1 The Company will take reasonable steps to maintain appropriate temperature and humidity conditions within the wine vault.",
      "8.2 Storage conditions may vary from time to time due to maintenance, power outages, equipment failure or circumstances beyond the Company’s reasonable control.",
      "8.3 The Company does not guarantee the condition, quality, maturity, drinkability or future value of any wine stored by a Member.",
    ],
  },
  {
    title: "9. Liability and Insurance",
    paragraphs: [
      "9.1 The Company shall exercise reasonable care in handling and storing Members’ wine.",
      "9.2 The Company’s total liability for any loss of or damage to a Member’s wine or other goods, however caused (including by the Company’s negligence), shall be limited to: (a) a maximum of £100 per bottle; and (b) a maximum of £250 per claim and £500 per Membership in any rolling 12-month period.",
      "9.3 The Company shall not be liable for any indirect, special or consequential loss, including but not limited to loss of profits, loss of business, loss of opportunity, loss of goodwill, loss of anticipated savings or any reduction in the value of wine.",
      "9.4 The Company shall not be liable for natural cork failure, seepage, oxidation, deterioration arising from age or inherent characteristics of the wine, manufacturing defects, changes in market value or circumstances beyond the Company’s reasonable control.",
      "9.5 Members are solely responsible for arranging and maintaining insurance cover for the full value of any wine or goods stored with the Company.",
      "9.6 By accepting these Terms & Conditions, the Member acknowledges that they have been advised to obtain appropriate insurance cover and accepts that the Company’s liability is limited as set out in this clause.",
    ],
  },
  {
    title: "10. Membership Fees",
    paragraphs: [
      "10.1 Membership fees are payable in advance and are non-refundable except where required by law.",
      "10.2 The Company may amend Membership fees by providing not less than 30 days’ notice to Members.",
      "10.3 Failure to maintain payment may result in suspension or termination of Membership.",
    ],
  },
  {
    title: "11. Termination",
    paragraphs: [
      "11.1 Members may cancel their Membership at any time by providing 30 days’ written notice.",
      "11.2 Upon cancellation or termination of Membership, Members must arrange collection of all stored wine within 30 days.",
      "11.3 Prior to exercising any right to sell or dispose of uncollected wine, the Company shall use reasonable endeavours to contact the Member using the most recent contact details provided.",
      "11.4 The Company reserves the right to charge additional storage fees for wine remaining after the collection period.",
      "11.5 Wine not collected within 12 months of termination may be treated as abandoned property and may be sold, disposed of or otherwise dealt with by the Company in order to recover any outstanding sums owed.",
    ],
  },
  {
    title: "12. Licensing Compliance",
    paragraphs: [
      "12.1 Members must comply with all licensing laws and any reasonable instructions given by Bodega staff.",
      "12.2 The Company reserves the right to refuse service where required by law, including where a person is intoxicated, underage or otherwise prohibited from being served alcohol.",
      "12.3 Membership does not guarantee access to alcohol and does not exempt Members from any licensing requirements or restrictions.",
    ],
  },
  {
    title: "13. Data Protection",
    paragraphs: [
      "13.1 The Company will process Members’ personal information in accordance with its Privacy Policy.",
    ],
  },
  {
    title: "14. Amendments",
    paragraphs: [
      "14.1 The Company reserves the right to amend these Terms & Conditions from time to time by providing reasonable notice to Members.",
    ],
  },
  {
    title: "15. Governing Law",
    paragraphs: [
      "15.1 These Terms & Conditions shall be governed by and construed in accordance with the laws of England and Wales.",
      "15.2 Any dispute arising in connection with these Terms & Conditions shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
    ],
  },
];

const individualDeclaration = [
  "I am aged 18 or over.",
  "All wine deposited with Bodega has been legally acquired and remains my property.",
  "I acknowledge that Bodega’s liability for loss of or damage to my wine is limited to £100 per bottle, £250 per claim and £500 per Membership in any rolling 12-month period.",
  "I have been advised to obtain appropriate insurance cover for the full value of my collection.",
  "I agree to be bound by these Terms & Conditions.",
];

const corporateSections = [
  {
    title: "1. Introduction",
    paragraphs: [
      "1.1 The Cellar Club is a wine storage membership operated by Bodega (“Bodega”, “the Company”, “we”, “us” or “our”).",
      "1.2 By applying for and maintaining a Corporate Cellar Club Membership, the Corporate Member agrees to be bound by these Terms & Conditions.",
      "1.3 The Corporate Member shall ensure that all Authorised Users comply with these Terms & Conditions.",
    ],
  },
  {
    title: "2. Corporate Membership",
    paragraphs: [
      "2.1 A Corporate Membership may be held by a company, partnership, LLP or other organisation approved by the Company (“Corporate Member”).",
      "2.2 The Corporate Member shall appoint a primary contact (“Membership Administrator”) responsible for administering the Membership.",
      "2.3 Membership commences when the Corporate Member’s application has been accepted and the applicable Membership fee has been paid.",
      "2.4 The Company reserves the right to refuse, suspend or terminate Membership where it reasonably believes that the Corporate Member or any Authorised User has breached these Terms & Conditions.",
    ],
  },
  {
    title: "3. Authorised Users",
    paragraphs: [
      "3.1 The Corporate Member may nominate Authorised Users in accordance with its Membership tier.",
      "3.2 Only Authorised Users recorded on the Company’s systems may deposit, access, request, withdraw or consume wine under the Membership.",
      "3.3 The maximum number of Authorised Users permitted under each Membership tier shall be:",
      "• Corporate 6 – 1 Authorised User",
      "• Corporate 12 – 2 Authorised Users",
      "• Corporate 18 – 3 Authorised Users",
      "• Corporate 24 – 4 Authorised Users",
      "3.4 Each Authorised User must provide a valid company email address associated with the Corporate Member.",
      "3.5 The Corporate Member shall ensure that its list of Authorised Users remains accurate and up to date at all times.",
      "3.6 The Corporate Member may add or remove Authorised Users by written notice to the Company.",
      "3.7 Changes to Authorised Users shall only take effect once confirmed by the Company.",
      "3.8 The Company reserves the right to refuse any proposed Authorised User where it reasonably believes that the individual is not connected with the Corporate Member.",
    ],
  },
  {
    title: "4. Wine Storage",
    paragraphs: [
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
    paragraphs: [
      "5.1 The Company reserves the right to request photographic identification from any Authorised User at any time.",
      "5.2 Acceptable forms of identification may include a passport, driving licence or any other form of identification reasonably approved by the Company.",
      "5.3 Failure to provide satisfactory identification may result in the Company refusing access to stored wine or Membership benefits.",
    ],
  },
  {
    title: "6. Depositing and Withdrawing Wine",
    paragraphs: [
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
    paragraphs: [
      "7.1 Authorised Users may only consume stored wine on the premises during licensed trading hours.",
      "7.2 Corkage charges may apply and shall be charged at the prevailing rate published by Bodega from time to time.",
    ],
  },
  {
    title: "8. Inventory Records",
    paragraphs: [
      "8.1 The Company may maintain a digital inventory of wine stored on behalf of the Corporate Member.",
      "8.2 The Company’s inventory records shall be deemed conclusive evidence of the quantity and identity of wine held on behalf of the Corporate Member unless the Corporate Member can demonstrate a manifest error.",
    ],
  },
  {
    title: "9. Storage Conditions",
    paragraphs: [
      "9.1 The Company will take reasonable steps to maintain appropriate temperature and humidity conditions within the wine vault.",
      "9.2 Storage conditions may vary from time to time due to maintenance, power outages, equipment failure or circumstances beyond the Company’s reasonable control.",
      "9.3 The Company does not guarantee the condition, quality, maturity, drinkability or future value of any wine stored by the Corporate Member.",
    ],
  },
  {
    title: "10. Liability and Insurance",
    paragraphs: [
      "10.1 The Company shall exercise reasonable care in handling and storing Members’ wine.",
      "10.2 The Company’s total liability for any loss of or damage to a Corporate Member’s wine or other goods, however caused (including by the Company’s negligence), shall be limited to: (a) a maximum of £100 per bottle; and (b) a maximum of £250 per claim and £500 per Membership in any rolling 12-month period.",
      "10.3 The Company shall not be liable for any indirect, special or consequential loss, including but not limited to loss of profits, loss of business, loss of opportunity, loss of goodwill, loss of anticipated savings or any reduction in the value of wine.",
      "10.4 The Company shall not be liable for natural cork failure, seepage, oxidation, deterioration arising from age or inherent characteristics of the wine, manufacturing defects, changes in market value or circumstances beyond the Company’s reasonable control.",
      "10.5 The Corporate Member is solely responsible for arranging and maintaining insurance cover for the full value of any wine or goods stored with the Company.",
      "10.6 By accepting these Terms & Conditions, the Corporate Member acknowledges that it has been advised to obtain appropriate insurance cover and accepts that the Company’s liability is limited as set out in this clause.",
    ],
  },
  {
    title: "11. Membership Fees",
    paragraphs: [
      "11.1 Membership fees are payable in advance and are non-refundable except where required by law.",
      "11.2 The Company may amend Membership fees by providing not less than 30 days’ notice to Members.",
      "11.3 Failure to maintain payment may result in suspension or termination of Membership.",
    ],
  },
  {
    title: "12. Termination",
    paragraphs: [
      "12.1 The Corporate Member may cancel its Membership at any time by providing 30 days’ written notice.",
      "12.2 Upon cancellation or termination of Membership, the Corporate Member must arrange collection of all stored wine within 30 days.",
      "12.3 Prior to exercising any right to sell or dispose of uncollected wine, the Company shall use reasonable endeavours to contact the Corporate Member using the most recent contact details provided.",
      "12.4 The Company reserves the right to charge additional storage fees for wine remaining after the collection period.",
      "12.5 Wine not collected within 12 months of termination may be treated as abandoned property and may be sold, disposed of or otherwise dealt with by the Company in order to recover any outstanding sums owed.",
    ],
  },
  {
    title: "13. Licensing Compliance",
    paragraphs: [
      "13.1 The Corporate Member and all Authorised Users must comply with all licensing laws and any reasonable instructions given by Bodega staff.",
      "13.2 The Company reserves the right to refuse service where required by law, including where a person is intoxicated, underage or otherwise prohibited from being served alcohol.",
      "13.3 Membership does not guarantee access to alcohol and does not exempt the Corporate Member or any Authorised User from licensing requirements or restrictions.",
    ],
  },
  {
    title: "14. Data Protection",
    paragraphs: [
      "14.1 The Company will process personal information in accordance with its Privacy Policy.",
      "14.2 The Corporate Member confirms that it has authority to provide the personal data of Authorised Users to the Company for the purposes of administering the Membership.",
    ],
  },
  {
    title: "15. Amendments",
    paragraphs: [
      "15.1 The Company reserves the right to amend these Terms & Conditions from time to time by providing reasonable notice to Members.",
    ],
  },
  {
    title: "16. Governing Law",
    paragraphs: [
      "16.1 These Terms & Conditions shall be governed by and construed in accordance with the laws of England and Wales.",
      "16.2 Any dispute arising in connection with these Terms & Conditions shall be subject to the exclusive jurisdiction of the courts of England and Wales.",
    ],
  },
];

const corporateDeclaration = [
  "It has authority to enter into these Terms & Conditions.",
  "All wine deposited with Bodega has been legally acquired and remains the property of the Corporate Member unless otherwise recorded by Bodega.",
  "It acknowledges that Bodega’s liability for loss of or damage to wine is limited to £100 per bottle, £250 per claim and £500 per Membership in any rolling 12-month period.",
  "It has been advised to obtain appropriate insurance cover for the full value of its collection.",
  "It agrees to be bound by these Terms & Conditions and shall ensure that all Authorised Users comply with them.",
];

export default function Terms() {
  const [view, setView] = useState("individual");
  const sections = view === "individual" ? individualSections : corporateSections;
  const declaration = view === "individual" ? individualDeclaration : corporateDeclaration;
  const declarationTitle = view === "individual" ? "Member Declaration" : "Corporate Declaration";
  const declarationIntro =
    view === "individual"
      ? "By proceeding with a Cellar Club Membership, I confirm that:"
      : "By proceeding with a Corporate Cellar Club Membership, the Corporate Member confirms that:";

  return (
    <div style={{ backgroundColor: "#f3f2ee", fontFamily: "'Courier New', Courier, monospace", minHeight: "100vh" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 36px" }}>

        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#0A242C", opacity: 0.5 }}>Bodega Cellar Club</p>
        <h1 className="text-2xl mb-2" style={{ color: "#1E4D5A", fontWeight: 400 }}>Cellar Club Terms & Conditions</h1>
        <p className="text-xs mb-6" style={{ color: "#0A242C", opacity: 0.5 }}>Last updated: June 2026</p>

        <div style={{ display: "flex", marginBottom: "40px" }}>
          <button
            onClick={() => setView("individual")}
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "12px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "10px 20px",
              border: "1px solid #d8d6d0",
              borderRadius: 0,
              backgroundColor: view === "individual" ? "#1E4D5A" : "transparent",
              color: view === "individual" ? "#f3f2ee" : "#0A242C",
              cursor: "pointer",
            }}
          >
            Individual Membership
          </button>
          <button
            onClick={() => setView("corporate")}
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "12px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "10px 20px",
              border: "1px solid #d8d6d0",
              borderLeft: "none",
              borderRadius: 0,
              backgroundColor: view === "corporate" ? "#1E4D5A" : "transparent",
              color: view === "corporate" ? "#f3f2ee" : "#0A242C",
              cursor: "pointer",
            }}
          >
            Corporate Membership
          </button>
        </div>

        {sections.map(({ title, paragraphs }) => (
          <div key={title} style={{ marginBottom: "32px" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#1E4D5A" }}>{title}</p>
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-sm leading-relaxed"
                style={{ color: "#0A242C", marginBottom: "8px", paddingLeft: paragraph.startsWith("•") ? "16px" : 0 }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}

        <div style={{ marginBottom: "32px" }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#1E4D5A" }}>{declarationTitle}</p>
          <p className="text-sm leading-relaxed mb-2" style={{ color: "#0A242C" }}>{declarationIntro}</p>
          {declaration.map((item, index) => (
            <p key={index} className="text-sm leading-relaxed" style={{ color: "#0A242C", marginBottom: "8px", paddingLeft: "16px" }}>
              • {item}
            </p>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #d8d6d0", paddingTop: "24px", marginTop: "24px" }}>
          <p className="text-xs" style={{ color: "#0A242C", opacity: 0.6 }}>
            For any questions about these terms, please contact us at{" "}
            <a href="mailto:hello@bodegawine.co.uk" style={{ color: "#1E4D5A" }}>hello@bodegawine.co.uk</a>.
          </p>
        </div>

      </div>
    </div>
  );
}