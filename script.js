const formPrefix = "invoice";
const initialForms = 5;
const cloneBtn = document.querySelector(".clone");
const total = document.querySelector('input[name="total"]');
const amnts = [...document.querySelectorAll('input[name$="-amount"]')];
const form = document.querySelector("form");

// Update lines & totals on change
form.addEventListener("change", (event) => {
  const tgt = event.target;
  if (
    tgt.matches('input[name$="-price"]') ||
    tgt.matches('input[name$="-qty"]') ||
    tgt.matches('input[name$="-received"]') ||
    tgt.matches('input[name$="-selled"]')
  ) {
    // Try to update amount
    const parent = tgt.closest(".item");
    const price = parent.querySelector('input[name$="-price"]');
    const qty = parent.querySelector('input[name$="-qty"]');
    const received = parent.querySelector('input[name$="-received"]');
    const selled = parent.querySelector('input[name$="-selled"]');
    const amnt = parent.querySelector('input[name$="-amount"]');

    if (!isNaN(price.value) && !isNaN(qty.value)) {
      // Good values
      const amount =
        Math.round((price.value * qty.value + Number.EPSILON) * 100) / 100;
      amnt.value = `$${amount.toFixed(2)}`;
      tally();
      price.classList.remove("error");
      qty.classList.remove("error");
    } else {
      // Bad values
      price.classList.add("error");
      qty.classList.add("error");
      amnt.value = "$0.00";
    }

    // Calculate total items present for the row
    const totalItemsPresent = received.value - selled.value;
    console.log(`Total Items Present for this row: ${totalItemsPresent}`);
  }
});

// Compute total
function tally() {
  let sum = amnts.reduce((acc, amnt) => {
    // Remove non-numerics (dollar sign) from string
    const numString = amnt.value.replace(/[^0-9.-]+/g, "");
    const num = parseFloat(numString);
    if (isNaN(num)) {
      return acc;
    }
    return acc + num;
  }, 0);
  sum = Math.round((sum + Number.EPSILON) * 100) / 100;
  total.value = `$${sum.toFixed(2)}`;
}

// Add item button
cloneBtn.addEventListener("click", () => {
  try {
    cloneForm(".item", formPrefix, false, function (obj) {
      // Callback functionality
      initializeItem(obj.newForm);
    });
  } catch (error) {
    if (error instanceof FormNotFoundError) {
      alert("Unable to add item!");
    } else if (error instanceof TooManyFormsError) {
      alert("Too many items!");
    } else {
      throw error;
    }
  }
});

function getFormIndex(input) {
  const indexRegex = new RegExp("-(\\d+)-");
  const match = input.name.match(indexRegex);
  if (match) {
    return Number(match[1]);
  }
  return null;
}

function initializeItem(formRow) {
  const desc = formRow.querySelector('input[name$="-desc"]');
  const formIndex = getFormIndex(desc);
  desc.value = `Item ${formIndex + 1}`;
  formRow.querySelector('input[name$="-price"]').value = "0";
  formRow.querySelector('input[name$="-qty"]').value = "0";
  formRow.querySelector('input[name$="-received"]').value = "0";
  formRow.querySelector('input[name$="-selled"]').value = "0";
  const amnt = formRow.querySelector('input[name$="-amount"]');
  amnt.value = "$0.00";
  amnts.push(amnt);
}

// Clone form
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
      throw new TooManyFormsError(
        "Unable to add additional form. Max Forms threshold has been met"
      );
    } else {
      const newForm = ancestor.cloneNode(true);
      const regex = RegExp(`${prefix}-(\\d+)-`);
      let total = totalElement.value;

      newForm.querySelectorAll("input, select, textarea").forEach((input) => {
        const name = input
          .getAttribute("name")
          .replace(regex, `${prefix}-${total}-`);
        const id = `id_${name}`;
        input.setAttribute("name", name);
        input.setAttribute("id", id);
        input.value = "";
        if (remove_checked) {
          input.removeAttribute("checked");
        }
      });

      newForm.querySelectorAll("label").forEach((label) => {
        const newFor = label
          .getAttribute("for")
          .replace(regex, `${prefix}-${total}-`);
        label.setAttribute("for", newFor);
      });

      total++;
      totalElement.value = total;

      if (additionalFn) {
        additionalFn({
          newForm: newForm,
          ancestor: ancestor,
          total: total
        });
      }
      ancestor.after(newForm);
    }
  } else {
    throw new FormNotFoundError(
      "Unable to retrieve existing form to clone. Check your selector is correct and at least one form exists."
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  for (let i = 1; i < initialForms; i++) {
    try {
      cloneForm(".item", formPrefix, false, function (obj) {
        initializeItem(obj.newForm);
      });
    } catch (error) {
      // Handle errors silently
    }
  }
  tally();
});

document.getElementById("rameezConnect").addEventListener("click", function() {
  window.open("https://wa.me/919797054815", "_blank");
});