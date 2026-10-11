/* =====================================
   API URLs
===================================== */

const API = {

    // Get public IP
    IP:
        "https://api.ipify.org?format=json",

    // Get location information from IP
    IP_INFO: (ip) =>
        `https://ipapi.co/${encodeURIComponent(ip)}/json/`,

    // Get post offices from pincode
    POST_OFFICE: (pincode) =>
        `https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`
};


/* =====================================
   VARIABLES
===================================== */

let userIp = "";

let userInfo = null;

let postOffices = [];


/* =====================================
   DOM ELEMENTS
===================================== */

const welcomeSection =
    document.getElementById("welcomeSection");

const resultSection =
    document.getElementById("resultSection");

const initialIp =
    document.getElementById("initialIp");

const getStartedBtn =
    document.getElementById("getStartedBtn");

const loadingOverlay =
    document.getElementById("loadingOverlay");

const errorBox =
    document.getElementById("errorBox");


/* IP information */

const ipAddress =
    document.getElementById("ipAddress");

const latitude =
    document.getElementById("latitude");

const longitude =
    document.getElementById("longitude");

const city =
    document.getElementById("city");

const region =
    document.getElementById("region");

const organisation =
    document.getElementById("organisation");

const hostname =
    document.getElementById("hostname");


/* More information */

const timezone =
    document.getElementById("timezone");

const dateTime =
    document.getElementById("dateTime");

const pincode =
    document.getElementById("pincode");

const pincodeMessage =
    document.getElementById("pincodeMessage");


/* Map */

const mapFrame =
    document.getElementById("mapFrame");


/* Post offices */

const searchInput =
    document.getElementById("searchInput");

const postOfficeGrid =
    document.getElementById("postOfficeGrid");

const noResults =
    document.getElementById("noResults");

const resultCount =
    document.getElementById("resultCount");


/* =====================================
   SHOW / HIDE LOADING
===================================== */

function showLoading(isLoading) {

    if (isLoading) {

        loadingOverlay.classList.remove("hidden");

        getStartedBtn.disabled = true;

    } else {

        loadingOverlay.classList.add("hidden");

        getStartedBtn.disabled = false;
    }
}


/* =====================================
   ERROR
===================================== */

function showError(message) {

    errorBox.textContent = message;

    errorBox.classList.remove("hidden");
}


function clearError() {

    errorBox.textContent = "";

    errorBox.classList.add("hidden");
}


/* =====================================
   GENERIC FETCH FUNCTION
===================================== */

async function fetchData(url) {

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            `Request failed with status ${response.status}`
        );
    }

    return await response.json();
}


/* =====================================
   STEP 1
   GET PUBLIC IP
===================================== */

async function getPublicIP() {

    const data =
        await fetchData(API.IP);

    if (!data.ip) {

        throw new Error(
            "Unable to detect public IP address."
        );
    }

    return data.ip;
}


/* =====================================
   STEP 2
   GET IP INFORMATION
===================================== */

async function getIPInformation(ip) {

    const data =
        await fetchData(
            API.IP_INFO(ip)
        );

    if (data.error) {

        throw new Error(
            data.reason ||
            "Unable to get IP information."
        );
    }

    return data;
}


/* =====================================
   STEP 3
   DISPLAY GOOGLE MAP
===================================== */

function updateMap(latitudeValue, longitudeValue) {

    if (
        latitudeValue === undefined ||
        longitudeValue === undefined
    ) {

        mapFrame.src = "about:blank";

        return;
    }


    /*
       Google Maps embedded map.

       No Google Maps JavaScript API key
       is required for this simple embed.
    */

    const location =
        `${latitudeValue},${longitudeValue}`;

  

    mapFrame.src =
        `https://www.google.com/maps?q=${encodeURIComponent(location)}&z=14&output=embed`;
}


/* =====================================
   STEP 4
   CURRENT TIME
===================================== */

function updateDateTime(timezoneValue) {

    if (!timezoneValue) {

        dateTime.textContent =
            "Not available";

        return;
    }


    try {

        const currentDate =
            new Date();


        const formattedDate =
            new Intl.DateTimeFormat(
                "en-IN",
                {
                    timeZone: timezoneValue,

                    dateStyle: "medium",

                    timeStyle: "medium"
                }
            ).format(currentDate);


        dateTime.textContent =
            formattedDate;

    } catch (error) {

        console.error(error);

        dateTime.textContent =
            "Unable to determine time";
    }
}


/* =====================================
   STEP 5
   GET POST OFFICES
===================================== */

async function getPostOffices(pin) {

    if (!pin) {

        return {
            message:
                "Pincode not available",

            offices: []
        };
    }


    const data =
        await fetchData(
            API.POST_OFFICE(pin)
        );


    if (
        !Array.isArray(data) ||
        !data[0]
    ) {

        throw new Error(
            "Invalid response from postal API."
        );
    }


    return {

        message:
            data[0].Message ||
            "No message",

        offices:
            Array.isArray(data[0].PostOffice)
                ? data[0].PostOffice
                : []
    };
}


/* =====================================
   DISPLAY USER INFORMATION
===================================== */

function displayUserInformation(data) {

    /* IP */

    ipAddress.textContent =
        userIp;


    /* Location */

    latitude.textContent =
        data.latitude ?? "-";

    longitude.textContent =
        data.longitude ?? "-";

    city.textContent =
        data.city ?? "-";

    region.textContent =
        data.region ?? "-";


    /* Organisation */

    organisation.textContent =
        data.org ?? "-";


    /* Hostname */

    hostname.textContent =
        data.hostname ?? "-";


    /* Timezone */

    timezone.textContent =
        data.timezone ?? "-";


    /* Pincode */

    pincode.textContent =
        data.postal ?? "-";


    /* Current time */

    updateDateTime(
        data.timezone
    );


    /* Google map */

    updateMap(
        data.latitude,
        data.longitude
    );
}


/* =====================================
   ESCAPE HTML
===================================== */

function escapeHTML(value) {

    return String(value ?? "-")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}


/* =====================================
   DISPLAY POST OFFICES
===================================== */

function displayPostOffices(offices) {

    postOfficeGrid.innerHTML = "";


    resultCount.textContent =
        `${offices.length} post office(s) found.`;


    if (offices.length === 0) {

        noResults.classList.remove("hidden");

        return;
    }


    noResults.classList.add("hidden");


    offices.forEach((office) => {

        const card =
            document.createElement("div");


        card.className =
            "post-office-card";


        card.innerHTML = `

            <p>
                <strong>Name:</strong>
                ${escapeHTML(office.Name)}
            </p>

            <p>
                <strong>Branch Type:</strong>
                ${escapeHTML(office.BranchType)}
            </p>

            <p>
                <strong>Delivery Status:</strong>
                ${escapeHTML(office.DeliveryStatus)}
            </p>

            <p>
                <strong>District:</strong>
                ${escapeHTML(office.District)}
            </p>

            <p>
                <strong>Division:</strong>
                ${escapeHTML(office.Division)}
            </p>

        `;


        postOfficeGrid.appendChild(card);
    });
}


/* =====================================
   STEP 6
   SEARCH POST OFFICES
===================================== */

function searchPostOffices(searchValue) {

    const searchText =
        searchValue
            .trim()
            .toLowerCase();


    /* Empty search */

    if (!searchText) {

        displayPostOffices(
            postOffices
        );

        return;
    }


    /* Filter */

    const filteredOffices =
        postOffices.filter((office) => {

            const name =
                String(
                    office.Name || ""
                ).toLowerCase();


            const branchType =
                String(
                    office.BranchType || ""
                ).toLowerCase();


            return (
                name.includes(searchText) ||
                branchType.includes(searchText)
            );
        });


    displayPostOffices(
        filteredOffices
    );
}


/* =====================================
   MAIN APPLICATION
===================================== */

async function loadApplication() {

    clearError();

    showLoading(true);


    try {

        /* =============================
           GET IP
        ============================= */

        userIp =
            await getPublicIP();


        /* =============================
           GET IP INFORMATION
        ============================= */

        userInfo =
            await getIPInformation(
                userIp
            );


        /* =============================
           DISPLAY INFORMATION
        ============================= */

        displayUserInformation(
            userInfo
        );


        /* =============================
           GET POST OFFICES
        ============================= */

        const postalData =
            await getPostOffices(
                userInfo.postal
            );


        postOffices =
            postalData.offices;


        pincodeMessage.textContent =
            postalData.message;


        /* =============================
           DISPLAY POST OFFICES
        ============================= */

        displayPostOffices(
            postOffices
        );


        /* =============================
           CHANGE SCREEN
        ============================= */

        welcomeSection.classList.add(
            "hidden"
        );

        resultSection.classList.remove(
            "hidden"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(error);


        showError(
            error.message ||
            "Something went wrong."
        );

    } finally {

        showLoading(false);
    }
}


/* =====================================
   BUTTON EVENT
===================================== */

getStartedBtn.addEventListener(
    "click",
    loadApplication
);


/* =====================================
   SEARCH EVENT
===================================== */

searchInput.addEventListener(
    "input",
    function (event) {

        searchPostOffices(
            event.target.value
        );
    }
);


/* =====================================
   PAGE LOAD
===================================== */

async function initializeApplication() {

    try {

        /*
          Get IP immediately so it appears
          on the first screen.
        */

        userIp =
            await getPublicIP();


        initialIp.textContent =
            userIp;

    } catch (error) {

        console.error(error);


        initialIp.textContent =
            "Unable to detect";


        showError(
            "Could not detect your public IP. " +
            "Please check your internet connection."
        );
    }
}


/* Start */

initializeApplication();