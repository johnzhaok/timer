/**
 *  Default values
 */
const defaults = {
    'emom': {
        'emomMinutes': 1,
        'emomRounds': 8
    },
    'amrap': {
        'amrapMinutes': 5
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
                var element = document.getElementById(id);

                if (element !== null) {
                    element.innerHTML = value;
                    globalValues[type][id] = value;
                }
            }
        }
    }
}

/**
 *  Increment or decrement time or round settings
 */
const adjustSetting = (type, itemId, amount) => {
    var item = document.getElementById(itemId);

    if (item !== null) {
        var newValue = globalValues[type][itemId] + amount;
        globalValues[type][itemId] = newValue;
        item.innerHTML = newValue;
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
    let time = data[timerType + 'Minutes'] * 60;

    let minDisplay = document.getElementById('minDisplay');
    let secDisplay = document.getElementById('secDisplay');
    let completedRoundsDisplay = document.getElementById('completedRoundsDisplay');
    let totalRoundsDisplay = document.getElementById('totalRoundsDisplay');
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
                completedRoundsDisplay.innerHTML = 0;
                totalRoundsDisplay.innerHTML = 0;
                controlButtons.classList.remove('hidden');
                return;
            } else {
                // Begin next round
                curRound++;
                completedRoundsDisplay.innerHTML = curRound;
                remainingTime = time;
            }
        }

        // Update clock readout
        min = Math.floor(remainingTime / 60);
        sec = remainingTime % 60;

        minDisplay.innerHTML = min;
        secDisplay.innerHTML = String(sec).padStart(2, '0');

        // Calculate time deviation with system clock to compensate for timer inaccuracy
        ticks += 1000;
        diff = (new Date().getTime() - start) - ticks;
        console.log(remainingTime + ' ' + diff);
        setTimeout(() => runTimer(remainingTime - 1), 1000 - diff);
    }

    // Hide control panel buttons
    controlButtons.classList.add('hidden');

    completedRoundsDisplay.innerHTML = curRound;
    totalRoundsDisplay.innerHTML = totalRounds;
    setTimeout(() => runTimer(time), 1000);
}

document.addEventListener('DOMContentLoaded', function(event) {
    setDefaultValues();
});
