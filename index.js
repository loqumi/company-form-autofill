const API_KEY = "fc0c73681e0c56594041152ef28a667a33a140e2";
const input = document.getElementById("party");
const list = document.getElementById("list");

function typeDescription(type) {
    const TYPES = {
        INDIVIDUAL: "Индивидуальный предприниматель",
        LEGAL: "Организация"
    };
    return TYPES[type];
}

function join(arr) {
    const separator = arguments.length > 1 ? arguments[1] : ", ";
    return arr.filter(Boolean).join(separator);
}

function selectSuggestion(suggestion) {
    const { data } = suggestion;
    if (!data) return;

    const type = document.querySelector("#type");
    type.textContent = `${typeDescription(data.type)} (${data.type})`;

    const nameShort = document.querySelector("#name_short");
    const nameFull = document.querySelector("#name_full");
    if (data.name) {
        nameShort.value = data.name.short_with_opf || "";
        nameFull.value = data.name.full_with_opf || "";
    }

    const innKpp = document.querySelector("#inn_kpp");
    innKpp.value = join([data.inn, data.kpp], " / ");

    const address = document.querySelector("#address");
    if (data.address) {
        let addressValue = "";
        if (data.address.data.qc === "0") {
            addressValue = join([data.address.data.postal_code, data.address.value]);
        } else {
            addressValue = data.address.data.source;
        }
        address.value = addressValue;
    }
}

function getSuggestions() {
    const query = input.value;
    const url = `https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party`;
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Token ${API_KEY}`
        },
        body: JSON.stringify({ query })
    };
    fetch(url, options)
        .then((response) => response.json())
        .then((data) => {
            const suggestions = data.suggestions;
            displaySuggestions(suggestions);
        });
}

function displaySuggestions(suggestions) {
    console.log(suggestions);
    if (input.value) {
        list.style.display = "block";
    } else {
        list.style.display = "none";
    }

    list.innerHTML = "";
    const helperText = document.createElement("span");
    helperText.classList.add("helper-text");

    if (suggestions.length) {
        helperText.textContent = "выберите вариант или продолжите ввод";
    } else {
        helperText.textContent = "неизвестная организация";
    }
    list.append(helperText);

    suggestions.forEach((suggestion) => {
        const li = document.createElement("li");
        const title = document.createElement("p");
        title.textContent = suggestion.value;
        const description = document.createElement("p");
        const { data } = suggestion;
        description.textContent = join([data.inn, data.address.value], " ");
        description.classList.add("helper-text");
        li.append(title);
        li.append(description);

        li.addEventListener("click", () => {
            input.value = suggestion.value;
            list.style.display = "none";
            selectSuggestion(suggestion);
        });

        list.appendChild(li);
    });
}

input.addEventListener("input", getSuggestions);
