/**
 *  Default values
 */
const defaults = {
    'emom': {
        'emomTime': 60,
        'emomRounds': 8
    },
    'amrap': {
        'amrapTime': 300
    }
}

const globalValues = {
    'emom': {},
    'amrap': {}
}


/**
 *  Set default values
 */
const setDefaultValues = (resetType) => {
    for (let [type, values] of Object.entries(defaults)) {
        if (resetType == null || type == resetType) {
            for (let [id, value] of Object.entries(values)) {
                let el = document.getElementById(id);

                if (el !== null) {
                    globalValues[type][id] = value;
                    el.innerHTML = id.includes('Time') ? value / 60 : value;
                }
            }
        }
    }
}

/**
 *  Increment or decrement time or round settings
 */
const adjustSetting = (type, id, interval) => {
    let item = document.getElementById(id);

    if (item !== null) {
        let curValue = globalValues[type][id];
        let newValue;

        // Snap to closest interval step
        if (interval > 0) {
            newValue = curValue + (interval - (curValue % interval));
        } else {
            if (curValue % interval != 0) {
                newValue = curValue - (curValue % interval);
            } else {
                newValue = curValue + interval;
            }
        }

        if (newValue > 0) {
            globalValues[type][id] = newValue;
            item.innerHTML = id.includes('Time') ? newValue / 60 : newValue;
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
            sibling.classList.add('active');
        } else {
            sibling.classList.remove('active');
        }

        sibling = sibling.nextElementSibling;
    }

    // Open correct control panel
    let panel = document.getElementById(type + 'ControlPanel');
    sibling = panel.parentNode.firstElementChild;

    while (sibling) {
        if (sibling == panel) {
            sibling.classList.remove('hidden');
        } else {
            sibling.classList.add('hidden');
        }

        sibling = sibling.nextElementSibling;
    }
}

/**
 *  Start timer
 */
const startTimer = (timerType) => {
    let data = globalValues[timerType];
    let time = data[timerType + 'Time'];

    let minDisplay = document.getElementById('minDisplay');
    let secDisplay = document.getElementById('secDisplay');
    let curRoundDisplay = document.getElementById('curRoundDisplay');
    let totalRoundDisplay = document.getElementById('totalRoundDisplay');
    let controlButtons = document.getElementById(timerType + 'ControlButtons');

    let min = Math.floor(time / 60);
    let sec = time % 60;

    let totalRounds = timerType == 'emom' ? data[timerType + 'Rounds'] : 1;
    let curRound = 1;

    let start = new Date().getTime();
    let ticks = 0;
    let diff = 0;

    /**
     *  Run timer
     */
    const runTimer = (remainingTime) => {
        if (remainingTime < 0) {
            if (curRound >= totalRounds) {
                // End timer and clear displays
                minDisplay.innerHTML = 0;
                secDisplay.innerHTML = String(0).padStart(2, '0');
                curRoundDisplay.innerHTML = 0;
                totalRoundDisplay.innerHTML = 0;
                controlButtons.classList.remove('hidden');
                return;
            } else {
                // Begin next round
                curRound++;
                curRoundDisplay.innerHTML = curRound;
                remainingTime = time;
            }
        }

        // Update clock readout
        min = Math.floor(remainingTime / 60);
        sec = remainingTime % 60;

        minDisplay.innerHTML = min;
        secDisplay.innerHTML = String(sec).padStart(2, '0');

        // Compensate for timer inaccuracy using system clock
        ticks += 1000;
        diff = (new Date().getTime() - start) - ticks;
        setTimeout(() => runTimer(remainingTime - 1), 1000 - diff);
    }

    // Hide control panel buttons
    controlButtons.classList.add('hidden');

    curRoundDisplay.innerHTML = curRound;
    totalRoundDisplay.innerHTML = totalRounds;
    setTimeout(() => runTimer(time), 1000);
}

document.addEventListener('DOMContentLoaded', function(event) {
    setDefaultValues();
});
