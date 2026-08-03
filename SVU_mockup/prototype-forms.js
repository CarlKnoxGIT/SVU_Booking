const prototypeForms = document.querySelectorAll("[data-prototype-form]");

prototypeForms.forEach((form) => {
    const status = form.querySelector("[data-form-status]");

    form.addEventListener("input", () => {
        if (!status || !status.textContent) return;

        status.textContent = "";
        status.classList.remove("is-visible");
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!status) return;

        const formName = form.dataset.formName || "form";
        status.textContent = `Thank you. This ${formName} has been validated for the prototype, but no information was sent or stored.`;
        status.classList.add("is-visible");
    });
});
