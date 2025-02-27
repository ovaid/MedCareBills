const formPrefix = "invoice";
const total = document.querySelector('input[name="total"]');
const form = document.querySelector("form");

// Load existing data from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
    loadRowsFromLocalStorage();
    tally();
});

// Update rows and totals on change
form.addEventListener("change", (event) => {
    const tgt = event.target;
    if (
        tgt.matches('input[name$="-received"]') ||
        tgt.matches('input[name$="-selled"]') ||
        tgt.matches('input[name$="-price"]')
    ) {
        updateRow(tgt.closest(".item"));
    }
});

// Update a single row
function updateRow(row) {
    const received = parseFloat(row.querySelector('input[name$="-received"]').value) || 0;
    const selled = parseFloat(row.querySelector('input[name$="-selled"]').value) || 0;
    const price = parseFloat(row.querySelector('input[name$="-price"]').value) || 0;
    

    const inStock = received - selled; // Current stock
    const amount = price * inStock; // Amount for this row
    const totalValue = received - selled; // Compute total (received - selled)

    row.querySelector('input[name$="-inStock"]').value = inStock;
    row.querySelector('input[name$="-amount"]').value = `$${amount.toFixed(2)}`;
    row.querySelector('input[name$="-total"]').value = totalValue; // Update total field

    tally();
    saveRowsToLocalStorage();
}


// Compute total
function tally() {
    let totalInStock = 0;
    let totalAmount = 0;

    document.querySelectorAll(".item").forEach((row) => {
        const inStock = parseFloat(row.querySelector('input[name$="-inStock"]').value) || 0;
        const amount = parseFloat(
            row.querySelector('input[name$="-amount"]').value.replace(/[^0-9.-]+/g, "")
        ) || 0;

        totalInStock += inStock;
        totalAmount += amount;
    });

    total.value = `Total inStock: ${totalInStock} | Total Amount: $${totalAmount.toFixed(2)}`;
}

// Add item button
document.addEventListener("click", (event) => {
    if (event.target.closest(".add-btn")) {
        try {
            cloneForm(".item", formPrefix, false, initializeItem);
            saveRowsToLocalStorage();
        } catch (error) {
            alert(error.message);
        }
    }
});

// Initialize a new row
function initializeItem(obj) {
    const newForm = obj.newForm;
    const formIndex = obj.total - 1;

    newForm.querySelector('input[name$="-desc"]').value = `Item ${formIndex + 1}`;
    newForm.querySelector('input[name$="-received"]').value = "0";
    newForm.querySelector('input[name$="-selled"]').value = "0";
    newForm.querySelector('input[name$="-price"]').value = "0";
    newForm.querySelector('input[name$="-inStock"]').value = "0";
    newForm.querySelector('input[name$="-amount"]').value = "$0.00";

    const deleteBtn = newForm.querySelector(".delete-btn");
    deleteBtn.disabled = false;
    deleteBtn.addEventListener("click", () => {
        if (document.querySelectorAll(".item").length > 1) {
            newForm.remove();
            tally();
            saveRowsToLocalStorage();
        } else {
            alert("At least one row must remain.");
        }
    });
}

// Clone form logic
class FormNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "FormNotFoundError";
    }
}

class TooManyFormsError extends Error {
    constructor(message) {
        super(message);
        this.name = "TooManyFormsError";
    }
}

function cloneForm(selector, prefix, remove_checked = true, additionalFn) {
    const ancestor = [...document.querySelectorAll(selector)].pop();
    if (ancestor) {
        const maxForms = document.querySelector('input[name$="-MAX_NUM_FORMS"]');
        const totalElement = document.querySelector('input[name$="-TOTAL_FORMS"]');
        if (maxForms.value === totalElement.value) {
            throw new TooManyFormsError("Too many items!");
        } else {
            const newForm = ancestor.cloneNode(true);
            const regex = RegExp(`${prefix}-(\\d+)-`);
            let total = totalElement.value;

            newForm.querySelectorAll("input, select, textarea").forEach((input) => {
                const name = input.getAttribute("name").replace(regex, `${prefix}-${total}-`);
                const id = `id_${name}`;
                input.setAttribute("name", name);
                input.setAttribute("id", id);
                input.value = "";
                if (remove_checked) input.removeAttribute("checked");
            });

            newForm.querySelectorAll("label").forEach((label) => {
                const newFor = label.getAttribute("for").replace(regex, `${prefix}-${total}-`);
                label.setAttribute("for", newFor);
            });

            total++;
            totalElement.value = total;

            if (additionalFn) additionalFn({ newForm, ancestor, total });
            ancestor.after(newForm);
        }
    } else {
        throw new FormNotFoundError("Unable to add item!");
    }
}

// Save Rows to Local Storage
function saveRowsToLocalStorage() {
    const rowsData = [];
    document.querySelectorAll(".item").forEach((row) => {
        rowsData.push({
            desc: row.querySelector('input[name$="-desc"]').value,
            received: row.querySelector('input[name$="-received"]').value,
            selled: row.querySelector('input[name$="-selled"]').value,
            price: row.querySelector('input[name$="-price"]').value,
            inStock: row.querySelector('input[name$="-inStock"]').value,
            amount: row.querySelector('input[name$="-amount"]').value,
            total: row.querySelector('input[name$="-total"]').value, // Store total
        });
        
    });
    localStorage.setItem("invoiceData", JSON.stringify(rowsData));
}

// Load Rows from Local Storage
function loadRowsFromLocalStorage() {
    const rowsData = JSON.parse(localStorage.getItem("invoiceData")) || [];
    rowsData.forEach((data, index) => {
        if (index > 0) {
            cloneForm(".item", formPrefix, false, initializeItem);
        }
        const row = document.querySelectorAll(".item")[index];
        row.querySelector('input[name$="-desc"]').value = data.desc;
        row.querySelector('input[name$="-received"]').value = data.received;
        row.querySelector('input[name$="-selled"]').value = data.selled;
        row.querySelector('input[name$="-price"]').value = data.price;
        row.querySelector('input[name$="-inStock"]').value = data.inStock;
        row.querySelector('input[name$="-amount"]').value = data.amount;
        
    });
}

// Open WhatsApp
function openWhatsApp() {
    const phoneNumber = "9797953250"; // Replace with your WhatsApp number
    const message = encodeURIComponent("Greetings on you!\n\nHow can we help you?");
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    
    window.open(whatsappURL, "_blank");
}

// Call Phone
function callPhone() {
    const phoneNumber = "9797953250"; // Replace with your actual phone number
    window.location.href = `tel:${phoneNumber}`;
}
