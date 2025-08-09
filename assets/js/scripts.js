/**
 *  Default values
 */
const defaults = {
    "emom": {
        "emomMinutes": 1,
        "emomRounds": 8
    },
    "amrap": {
        "amrapMinutes": 10
    }
}

const globalValues = {}

/**
 *  Set default values
 */
const setDefaultValues = (resetType) => {
    for (let [type, values] of Object.entries(defaults)) {
        for (let [id, value] of Object.entries(values)) {
            var element = document.getElementById(id);

            if (element !== null) {
                element.innerHTML = value;
                globalValues[id] = value;
            }
        }
    }
}

/**
 *  Switch timer type
 */
const switchType = (element, type) => {
    // Toggle active type button
    let sibling = element.parentNode.firstElementChild;

    while (sibling) {
        if (sibling == element) {
            sibling.classList.add("active");
        } else {
            sibling.classList.remove("active");
        }

        sibling = sibling.nextElementSibling;
    }

    // Open correct control panel
    let panel = document.getElementById(type + "ControlPanel");
    sibling = panel.parentNode.firstElementChild;

    while (sibling) {
        if (sibling == panel) {
            sibling.classList.remove("hidden");
        } else {
            sibling.classList.add("hidden");
        }

        sibling = sibling.nextElementSibling;
    }
}

/**
 *  Increment or decrement time or round settings
 */
const adjustSetting = (itemId, amount) => {
    var item = document.getElementById(itemId);

    if (item !== null) {
        var newValue = globalValues[itemId] + amount;
        globalValues[itemId] = newValue;
        item.innerHTML = newValue;
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    setDefaultValues();
});
