// --- Validation Helpers ---

function markInvalid(element, message) {
  element.classList.add("invalid");
  
  // Remove any existing message
  const oldMsg = element.parentNode.querySelector(".error-msg");
  if (oldMsg) oldMsg.remove();

  // Add new message
  const msg = document.createElement("div");
  msg.className = "error-msg";
  msg.textContent = message;
  element.parentNode.appendChild(msg);
}

function clearInvalids() {
  document.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));
  document.querySelectorAll(".error-msg").forEach(e => e.remove());
}

function validateInputs() {
  clearInvalids(); // clean slate

  switch (currentType) {

    case "url": {
      const input = document.getElementById("input-url");
      const url = input.value.trim();

      const pattern = /^(https?:\/\/)[\w.-]+/i;

      if (!pattern.test(url)) {
        markInvalid(input, "Enter a valid URL starting with http:// or https://");
        return false;
      }

      return true;
    }

    case "phone": {
  const codeEl = document.getElementById("phone-code");
  const input = document.getElementById("phone-number");
  const code = (codeEl && codeEl.value || "").trim();
  const num = (input && input.value || "").trim();

  if (!/^\+?\d{1,4}$/.test(code)) {
    markInvalid(codeEl, "Enter a valid country code like +91");
    return false;
  }

  if (!/^\d{6,15}$/.test(num)) {
    markInvalid(input, "Enter a valid local phone number (6–15 digits)");
    return false;
  }

  return true; 
  }


    case "email": {
      const email = document.getElementById("email-address");
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!pattern.test(email.value.trim())) {
        markInvalid(email, "Enter a valid email address");
        return false;
      }

      return true;
    }

    case "wifi": {
      const ssid = document.getElementById("wifi-ssid");
      if (ssid.value.trim().length === 0) {
        markInvalid(ssid, "WiFi name cannot be empty");
        return false;
      }
      return true;
    }

    case "text": {
      const text = document.getElementById("text-message");
      if (text.value.trim().length === 0) {
        markInvalid(text, "Text cannot be empty");
        return false;
      }
      return true;
    }

  case "whatsapp": {
  const codeEl = document.getElementById("wa-code");
  const numEl = document.getElementById("wa-number");
  const code = (codeEl && codeEl.value || "").trim();
  const num = (numEl && numEl.value || "").trim();

  if (!/^\+?\d{1,4}$/.test(code)) {
    markInvalid(codeEl, "Enter a valid country code like +91");
    return false;
  }

  if (!/^\d{6,15}$/.test(num)) {
    markInvalid(numEl, "Enter a valid WhatsApp local number (6–15 digits)");
    return false;
  }
  return true;
}


    case "vcard": {
      const name = document.getElementById("vc-name");
      const phone = document.getElementById("vc-phone");
      const email = document.getElementById("vc-email");

      if (
        name.value.trim().length === 0 &&
        phone.value.trim().length === 0 &&
        email.value.trim().length === 0
      ) {
        markInvalid(name, "Enter at least one contact field");
        return false;
      }

      return true;
    }

    default:
      return true;
  }
}

// --- Reset UI to initial/default state (after a QR is generated)
function resetUIToDefaults() {
  try {
    // clear text inputs
    const textIds = [
      "input-url", "wifi-ssid", "wifi-password", "email-address", "email-subject",
      "email-body", "text-message", "wa-message", "vc-name", "vc-phone",
      "vc-email", "vc-org"
    ];
    textIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    // reset country / phone fields
    const phoneCode = document.getElementById("phone-code");
    const waCode = document.getElementById("wa-code");
    const phoneNum = document.getElementById("phone-number");
    const waNum = document.getElementById("wa-number");
    if (phoneCode) phoneCode.value = "+91";
    if (waCode) waCode.value = "+91";
    if (phoneNum) phoneNum.value = "";
    if (waNum) waNum.value = "";

    // reset style
    setStyle("basic");

    // reset color pickers
    const cp = document.getElementById("colorPicker");
    const gp = document.getElementById("gradientPicker");
    if (cp) cp.value = "#00f2ff";
    if (gp) gp.value = "#ff00c8";

    // hide colored section
    const colorSection = document.getElementById("color-section");
    if (colorSection) colorSection.classList.add("hidden");

    // reset logo input
    const logoInput = document.getElementById("logoUpload");
    if (logoInput) logoInput.value = "";

    const nameEl = document.getElementById("logoName");
    if (nameEl) nameEl.textContent = "No file chosen";

    const clearBtn = document.getElementById("logoClear");
    if (clearBtn) clearBtn.classList.add("hidden");

    // reset QR type (optional)
    setType("url");

    // remove validation errors
    clearInvalids();

  } catch (e) {
    console.error("resetUIToDefaults error:", e);
  }
}


let qrCode = null;
let currentType = "url";
let currentStyle = "basic";
let isAnimating = false;

// --- Convert uploaded logo file into a square 1:1 dataURL (keeps aspect, centers, fills transparent background)
function processLogoFileToSquare(file, size = 120) {
  // returns a Promise resolving to dataURL (PNG)
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          // create square canvas
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");

          // fill transparent background (you can change to white if desired)
          ctx.clearRect(0, 0, size, size);

          // compute draw dimensions to preserve aspect ratio and center
          const iw = img.width;
          const ih = img.height;
          const scale = Math.max(size / iw, size / ih); // cover (fill) style
          const nw = iw * scale;
          const nh = ih * scale;
          const dx = (size - nw) / 2;
          const dy = (size - nh) / 2;

          ctx.drawImage(img, dx, dy, nw, nh);

          // export as PNG dataURL
          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}



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
  const codeEl = document.getElementById("phone-code");
  const numEl = document.getElementById("phone-number");

  let codeRaw = (codeEl && codeEl.value || "").trim();
  let numRaw = (numEl && numEl.value || "").trim();

  if (!numRaw) return null;

  // normalize code -> digits only (e.g. "+91" -> "91")
  let codeDigits = codeRaw.replace(/\D/g, "");
  // strip a leading 0s from code if any
  codeDigits = codeDigits.replace(/^0+/, "");

  // normalize number: digits only
  let numDigits = numRaw.replace(/\D/g, "");
  // if the user accidentally pasted a full international number into the number field,
  // and that starts with the country code digits, remove that prefix
  if (codeDigits && numDigits.startsWith(codeDigits)) {
    // remove the leading code digits from the number part
    numDigits = numDigits.slice(codeDigits.length);
  }
  // also remove leading zeros from local part (optional)
  numDigits = numDigits.replace(/^0+/, "");

  // final tel form with + sign (tel:+919876543210)
  return `tel:+${codeDigits}${numDigits}`;
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
  const codeEl = document.getElementById("wa-code");
  const numEl = document.getElementById("wa-number");
  const msg = document.getElementById("wa-message").value.trim();

  let codeRaw = (codeEl && codeEl.value || "").trim();
  let numRaw = (numEl && numEl.value || "").trim();

  if (!numRaw) return null;

  let codeDigits = codeRaw.replace(/\D/g, "");
  codeDigits = codeDigits.replace(/^0+/, "");

  let numDigits = numRaw.replace(/\D/g, "");
  if (codeDigits && numDigits.startsWith(codeDigits)) {
    numDigits = numDigits.slice(codeDigits.length);
  }
  numDigits = numDigits.replace(/^0+/, "");

  // wa.me wants number WITHOUT plus signs, only digits (country+local)
  const waNumber = `${codeDigits}${numDigits}`;
  const msgPart = msg ? `?text=${encodeURIComponent(msg)}` : "";

  return `https://wa.me/${waNumber}${msgPart}`;
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

    // handle logo (optional) - process to square then update QR
  const logoFileEl = document.getElementById("logoUpload");
  const logoFile = logoFileEl && logoFileEl.files && logoFileEl.files[0] ? logoFileEl.files[0] : null;

  if (logoFile) {
    // create square dataURL first, then update qr
    processLogoFileToSquare(logoFile, 140) // 140px square (adjust if needed)
      .then((squareDataUrl) => {
        if (squareDataUrl) {
          qrCode.update({ image: squareDataUrl });
        }
        renderQR();
        // --- IMPORTANT: clear the file input AFTER rendering, so it won't persist to next QR
        // this removes the file selection from UI and underlying input
        setTimeout(() => {
          try {
            logoFileEl.value = "";                          // reset input value
            const nameEl = document.getElementById("logoName");
            if (nameEl) nameEl.textContent = "No file chosen"; // reset custom UI if present
            const clearBtn = document.getElementById("logoClear");
            if (clearBtn) clearBtn.classList.add("hidden");
          } catch (e) {
            // ignore if not present
          }
        }, 150); // slight delay so QR library has processed the image
      })
      .catch((err) => {
        console.error("Logo processing failed:", err);
        // fallback: render QR without logo
        renderQR();
        // still clear the file input to avoid reuse
        try { logoFileEl.value = ""; } catch (e) {}
      });
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
    // reset UI after QR appears
  setTimeout(() => {
    resetUIToDefaults();
  }, 600);

}


// ---------- generate click: 3s square grow + auto scroll ----------

function handleGenerateClick() {
  if (isAnimating) return;

  // validate before running animation
  if (!validateInputs()) {
    return; // stop here if invalid
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

// -- Logo upload UI handlers (custom)
(function setupLogoUpload() {
  const realInput = document.getElementById("logoUpload");
  const btn = document.getElementById("logoBtn");
  const nameEl = document.getElementById("logoName");
  const clearBtn = document.getElementById("logoClear");

  if (!realInput || !btn || !nameEl || !clearBtn) return;

  // trigger file picker when custom button clicked
  btn.addEventListener("click", () => realInput.click());

  // show filename when changed
  realInput.addEventListener("change", () => {
    if (realInput.files && realInput.files.length > 0) {
      const f = realInput.files[0];
      // Truncate long filenames for UI
      const displayName = f.name.length > 36 ? f.name.slice(0, 18) + "…" + f.name.slice(-12) : f.name;
      nameEl.textContent = displayName;
      clearBtn.classList.remove("hidden");
    } else {
      nameEl.textContent = "No file chosen";
      clearBtn.classList.add("hidden");
    }
  });

  // clear selection
  clearBtn.addEventListener("click", () => {
    // reset input (works cross-browser)
    realInput.value = "";
    nameEl.textContent = "No file chosen";
    clearBtn.classList.add("hidden");
    // if you also update QR preview immediately elsewhere, you can call that
    // e.g. clear QR logo preview logic here if you added one
  });

  // allow keyboard activation (Enter/Space) on "Upload logo" button — already works since it's a <button>
})();
