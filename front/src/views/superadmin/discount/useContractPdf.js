import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import ApiCall from "../../../config/index";

export const useContractPdf = () => {
  const fetchStudentContract = async (passport_pin) => {
    try {
      const res = await ApiCall(
        `/api/v1/contract/pasport/${passport_pin}`,
        "GET"
      );
      console.log(res.data);

      return res.data;
    } catch (err) {
      console.error("Contract olishda xatolik:", err);
      return null;
    }
  };

  const downloadContract = async (student) => {
    if (!student) return;

    const getEl = (id) => document.getElementById(id);
    const root = getEl("contract-pdf");

    if (!root) {
      console.error(
        "contract-pdf elementi topilmadi. <ContractTemplate /> render bo'lganini tekshiring."
      );
      return;
    }

    // 🔹 API dan contract ma'lumotlari
    const contract = await fetchStudentContract(student.passport_pin);

    // let oldAmount = 0;
    // let newAmount = 0;
    // let discountAmount = 0;

    // if (contract && Number.isFinite(contract.amount)) {
    //   oldAmount = contract.amount;

    //   const discount = Number.isFinite(contract.discount)
    //     ? contract.discount
    //     : 0;
    //   discountAmount = discount;
    //   newAmount = oldAmount - discount;
    //   // BK raqam
    //   const hemisEl = getEl("c-hemisId");
    //   if (hemisEl) hemisEl.innerText = contract.hemisId || "";
    // } else {
    //   console.warn("API bo‘sh qaytdi — discountByYear ishlatilmoqda");

    //   // ⭐ 1 yoki ko‘p bo‘lsa ham discount summasi
    //   const discounts = student.discountByYear || [];
    //   const totalDiscount = discounts.reduce(
    //     (sum, d) => sum + (d.discount || 0),
    //     0
    //   );

    //   discountAmount = totalDiscount;

    //   // ⭐ oldAmountni to‘g‘ri olish
    //   oldAmount = student.amount || student.contractAmount || 0;

    //   // ⭐ yangi summa
    //   newAmount = oldAmount - discountAmount;
    // }

    // 🔹 Contract API dan summa
    const oldAmount = Number(contract?.amount) || 0;
    const TARGET_YEAR = "2025-2026";

    // 🔹 discountByYear dan jami chegirma
    const discounts = Array.isArray(student.discountByYear)
      ? student.discountByYear
      : [];
    const yearDiscount = discounts.find((d) => d.name === TARGET_YEAR);

    // 🔢 faqat shu yil summasi
    const discountAmount = Number(yearDiscount?.discount || 0);
    // 🔹 Yangi summa
    const newAmount = oldAmount - discountAmount;

    // 🔹 BK raqam
    const hemisEl = getEl("c-hemisId");
    if (hemisEl) hemisEl.innerText = contract?.hemisId || "";

    const formatAmount = (val) =>
      (val || 0).toLocaleString("uz-UZ").split(",").join(" ");
    const bk = `K${contract?.hemisId || student?.hemisId || ""}`;
    const bkEl = getEl("c-bk-number");
    const bkEl2 = getEl("c-bk-number-2");
    const bkEl3 = getEl("c-bk-number-3");

    if (bkEl) bkEl.innerText = bk;
    if (bkEl2) bkEl2.innerText = bk;
    if (bkEl3) bkEl3.innerText = bk;

    const old1 = getEl("c-old-amount");
    const old2 = getEl("c-old-amount-2");
    const neu1 = getEl("c-new-amount");
    const neu2 = getEl("c-new-amount-2");
    const disc1 = getEl("c-discount-amount");
    if (disc1) disc1.innerText = formatAmount(discountAmount);

    if (old1) old1.innerText = formatAmount(oldAmount);
    if (old2) old2.innerText = formatAmount(oldAmount);
    if (neu1) neu1.innerText = formatAmount(newAmount);
    if (neu2) neu2.innerText = formatAmount(newAmount);

    const dateEl = getEl("c-date");
    if (dateEl) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();

      dateEl.innerText = `${day}.${month}.${year}`;
    }

    const fullName = student.name || student.fullName || "";

    const name1 = getEl("c-name");
    const name2 = getEl("c-name-2");
    const name3 = getEl("c-name-3");

    if (name1) name1.innerText = fullName;
    if (name2) name2.innerText = fullName;
    if (name3) name3.innerText = fullName;

    const group1 = getEl("c-group");
    const group2 = getEl("c-group-2");
    const group3 = getEl("c-group-3");

    if (group1) group1.innerText = student.groupName || "";
    if (group2) group2.innerText = student.groupName || "";
    if (group3) group3.innerText = student.groupName || "";

    // 🔍 Element ko‘rinib turishi kerak (hidden/display:none bo‘lmasin!)
    // Agar kerak bo‘lsa, vaqtincha ko‘rinadigan qilib qo‘yish mumkin:
    // const prevDisplay = root.style.display;
    // root.style.display = "block";

    const canvas = await html2canvas(root, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    console.log("Canvas size:", imgWidth, imgHeight);

    if (!imgWidth || !imgHeight) {
      console.error(
        "Canvas o‘lchami 0 – contract-pdf elementining stilini tekshiring."
      );
      // root.style.display = prevDisplay;
      return;
    }

    const imgData = canvas.toDataURL("image/jpeg", 0.98);

    // 🧾 jsPDF’ni to‘g‘ridan-to‘g‘ri canvas o‘lchamida yaratamiz (px)
    const pdf = new jsPDF({
      orientation: imgWidth >= imgHeight ? "l" : "p",
      unit: "px",
      format: [imgWidth, imgHeight],
    });

    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Qoshimcha_Kelishuv_${fullName || "talaba"}.pdf`);

    // root.style.display = prevDisplay;
  };

  return { downloadContract };
};
