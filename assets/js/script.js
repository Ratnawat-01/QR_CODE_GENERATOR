let qrCode = null;
let currentType = "url";
let currentStyle = "basic";
let isAnimating = false;

// ---------- helpers for type & style ----------

function setType(type) {
  currentType = type;

  document.querySelectorAll(".type-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === type);
  });

  document.querySelectorAll(".type-section").forEach((sec) => {
    sec.classList.add("hidden");
  });
  const activeSec = document.getElementById("section-" + type);
  if (activeSec) activeSec.classList.remove("hidden");
}

function setStyle(style) {
  currentStyle = style;

  document.querySelectorAll(".style-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.style === style);
  });

  const colorSection = document.getElementById("color-section");
  if (style === "colored") {
    colorSection.classList.remove("hidden");
  } else {
    colorSection.classList.add("hidden");
  }
}

// ---------- build data string based on type ----------

function buildData() {
  switch (currentType) {
    case "url": {
      const url = document.getElementById("input-url").value.trim();
      return url || null;
    }
    case "wifi": {
      const ssid = document.getElementById("wifi-ssid").value.trim();
      const pass = document.getElementById("wifi-password").value.trim();
      const enc = document.getElementById("wifi-encryption").value;
      if (!ssid) return null;
      const pwdPart = enc === "nopass" ? "" : `P:${pass};`;
      return `WIFI:T:${enc};S:${ssid};${pwdPart};`;
    }
    case "phone": {
      const num = document.getElementById("phone-number").value.trim();
      return num ? `tel:${num}` : null;
    }
    case "email": {
      const addr = document.getElementById("email-address").value.trim();
      const subject = document.getElementById("email-subject").value.trim();
      const body = document.getElementById("email-body").value.trim();
      if (!addr) return null;
      const params = [];
      if (subject) params.push("subject=" + encodeURIComponent(subject));
      if (body) params.push("body=" + encodeURIComponent(body));
      const query = params.length ? "?" + params.join("&") : "";
      return `mailto:${addr}${query}`;
    }
    case "text": {
      const txt = document.getElementById("text-message").value.trim();
      return txt || null;
    }
    case "whatsapp": {
      const waNum = document.getElementById("wa-number").value.trim();
      const waMsg = document.getElementById("wa-message").value.trim();
      if (!waNum) return null;
      const msgPart = waMsg ? `?text=${encodeURIComponent(waMsg)}` : "";
      return `https://wa.me/${waNum.replace(/\D/g, "")}${msgPart}`;
    }
    case "vcard": {
      const name = document.getElementById("vc-name").value.trim();
      const phone = document.getElementById("vc-phone").value.trim();
      const email = document.getElementById("vc-email").value.trim();
      const org = document.getElementById("vc-org").value.trim();
      if (!name && !phone && !email) return null;
      let v = "BEGIN:VCARD\nVERSION:3.0\n";
      v += `FN:${name}\n`;
      if (name) v += `N:${name};;;;\n`;
      if (phone) v += `TEL;TYPE=CELL:${phone}\n`;
      if (email) v += `EMAIL:${email}\n`;
      if (org) v += `ORG:${org}\n`;
      v += "END:VCARD";
      return v;
    }
    default:
      return null;
  }
}

// ---------- core QR generation (no animation) ----------

function generateQRCore() {
  const data = buildData();
  if (!data) return false;

  const color = document.getElementById("colorPicker").value;
  const gradient = document.getElementById("gradientPicker").value;

  let dotsColor = "#000000";
  let bgColor = "#ffffff";
  let gradientOptions = null;

  if (currentStyle === "colored") {
    dotsColor = color;
    bgColor = "#020617";
    gradientOptions = {
      type: "linear",
      rotation: 0,
      colorStops: [
        { offset: 0, color: color },
        { offset: 1, color: gradient }
      ]
    };
  }

  qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    data: data,
    dotsOptions: {
      type: "rounded",
      color: dotsColor,
      gradient: gradientOptions
    },
    backgroundOptions: {
      color: bgColor
    },
    cornersSquareOptions: {
      type: "dot",
      color: dotsColor
    },
    cornersDotOptions: {
      color: dotsColor
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 6
    }
  });

  const logoFile = document.getElementById("logoUpload").files[0];
  if (logoFile) {
    const reader = new FileReader();
    reader.onload = (event) => {
      qrCode.update({ image: event.target.result });
      renderQR();
    };
    reader.readAsDataURL(logoFile);
  } else {
    renderQR();
  }

  if (currentType === "url") {
    document.getElementById("input-url").value = "";
  }

  return true;
}

function renderQR() {
  const wrapper = document.getElementById("qrOutput");
  wrapper.innerHTML = "";
  qrCode.append(wrapper);
  wrapper.classList.add("visible");

  const downloadWrapper = document.getElementById("downloadWrapper");
  downloadWrapper.classList.remove("hidden");

  // 🔥 After QR is fully placed, scroll so that
  // QR + Download + Share buttons are clearly visible
  downloadWrapper.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}


// ---------- generate click: 3s square grow + auto scroll ----------

function handleGenerateClick() {
  if (isAnimating) return;

  const data = buildData();
  if (!data) {
    alert("Please fill the required fields for the selected QR type.");
    return;
  }

  isAnimating = true;

  const wrapper = document.getElementById("qrOutput");
  const downloadWrapper = document.getElementById("downloadWrapper");

  wrapper.classList.remove("visible");
  wrapper.innerHTML = "";
  downloadWrapper.classList.add("hidden");

  const placeholder = document.createElement("div");
  placeholder.className = "qr-placeholder";
  wrapper.appendChild(placeholder);
  wrapper.classList.add("visible");

  // scroll so user always sees animation
  wrapper.scrollIntoView({ behavior: "smooth", block: "center" });

  setTimeout(() => {
    const ok = generateQRCore();
    if (!ok) {
      wrapper.innerHTML = "";
      wrapper.classList.remove("visible");
      downloadWrapper.classList.add("hidden");
    }
    isAnimating = false;
  }, 3000);
}

// ---------- download & share ----------

function downloadPNG() {
  if (!qrCode) {
    alert("Generate a QR first.");
    return;
  }
  qrCode.download({ extension: "png" });
}

async function shareQR() {
  if (!qrCode) {
    alert("Generate a QR first.");
    return;
  }

  if (!navigator.share || !navigator.canShare) {
    alert("Sharing is not supported on this browser. Please download the QR and share manually.");
    return;
  }

  try {
    const blob = await qrCode.getRawData("png");
    const file = new File([blob], "qr-code.png", { type: "image/png" });

    if (!navigator.canShare({ files: [file] })) {
      alert("Your device cannot share this file. Please download and share manually.");
      return;
    }

    await navigator.share({
      files: [file],
      title: "QR Code",
      text: "Here is your QR code."
    });
  } catch (err) {
    console.error(err);
    alert("Couldn't open share sheet. You can still download and share manually.");
  }
}

// ---------- paste button ----------

async function handlePasteClick() {
  const input = document.getElementById("input-url");

  // Clipboard API only works reliably on HTTPS or localhost
  if (!navigator.clipboard || !window.isSecureContext) {
    alert(
      "Paste button works best on HTTPS or localhost. Please paste manually (Ctrl+V / long-press → Paste)."
    );
    input.focus();
    return;
  }

  try {
    const text = await navigator.clipboard.readText();
    if (!text) {
      alert("Clipboard is empty. Copy a link first, then tap Paste.");
      return;
    }
    input.value = text;
  } catch (err) {
    console.error(err);
    alert(
      "Browser blocked clipboard access. Please paste manually (Ctrl+V / long-press → Paste)."
    );
    input.focus();
  }
}


// ---------- initial bindings ----------

document.addEventListener("DOMContentLoaded", () => {
  // type tabs
  document.querySelectorAll(".type-tab").forEach((btn) => {
    btn.addEventListener("click", () => setType(btn.dataset.type));
  });

  // style buttons
  document.querySelectorAll(".style-btn").forEach((btn) => {
    btn.addEventListener("click", () => setStyle(btn.dataset.style));
  });

  // buttons
  document.getElementById("btn-generate").addEventListener("click", handleGenerateClick);
  document.getElementById("btn-download").addEventListener("click", downloadPNG);
  document.getElementById("btn-share").addEventListener("click", shareQR);
  document.getElementById("btn-paste").addEventListener("click", handlePasteClick);

  // defaults
  setType("url");
  setStyle("basic");
});
