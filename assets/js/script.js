let qrCode;

function generateQR() {
    const link = document.getElementById("qrLink").value.trim();
    if (!link) {
        alert("Enter a URL!");
        return;
    }

    const style = document.getElementById("qrStyle").value;
    const color = document.getElementById("colorPicker").value;
    const gradient = document.getElementById("gradientPicker").value;
    const logoFile = document.getElementById("logoUpload").files[0];

    // Dot style mapping
    const styleTypes = {
        rounded: "rounded",
        dots: "dots",
        classy: "classy",
        heart: "heart",
        circle: "circle",
        tiktok: "dots",
        transparent: "dots",
        glow: "rounded"
    };

    const neonEffect = (style === "tiktok") ? "#00f2ff" : color;

    // Gradient setup
    const gradientOptions = gradient ? {
        type: "linear",
        rotation: 0,
        colorStops: [
            { offset: 0, color: color },
            { offset: 1, color: gradient }
        ]
    } : null;

    // Main QR config
    qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        data: link,

        dotsOptions: {
            type: styleTypes[style],
            color: neonEffect,
            gradient: gradientOptions
        },

        backgroundOptions: {
            color: style === "transparent" ? "rgba(0,0,0,0)" : "#0a0a0a"
        },

        cornersSquareOptions: {
            type: style === "heart" ? "extra-rounded" : "dot",
            color: color
        },

        cornersDotOptions: {
            color: color
        },

        imageOptions: {
            crossOrigin: "anonymous",
            margin: 8
        }
    });

    // Logo upload if any
    if (logoFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
            qrCode.update({
                image: event.target.result
            });
        };
        reader.readAsDataURL(logoFile);
    }

    // Glow special effect
    if (style === "glow") {
        document.getElementById("qrOutput").style.filter = "drop-shadow(0 0 20px " + color + ")";
    } else {
        document.getElementById("qrOutput").style.filter = "none";
    }

    document.getElementById("qrOutput").innerHTML = "";
    qrCode.append(document.getElementById("qrOutput"));
}

function downloadPNG() {
    qrCode.download({ extension: "png" });
}

function downloadSVG() {
    qrCode.download({ extension: "svg" });
}
