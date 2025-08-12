/**
 *  Default values
 */
const defaults = {
    'emom': {
        'emomCountIn': 5,
        'emomDuration': 60,
        'emomRounds': 8
    },
    'amrap': {
        'amrapCountIn': 10,
        'amrapDuration': 600
    }
}

const globalValues = {
    'emom': {},
    'amrap': {},
    'paused': false,
    'cancel': false
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
                    el.innerHTML = id.includes('Duration') ? value / 60 : value;
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
            item.innerHTML = id.includes('Duration') ? newValue / 60 : newValue;
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
    let countIn = data[timerType + 'CountIn'];
    let duration = data[timerType + 'Duration'];
    let totalRounds = timerType == 'emom' ? data[timerType + 'Rounds'] : 1;

    let minDisplay = document.getElementById('minDisplay');
    let secDisplay = document.getElementById('secDisplay');
    let curRoundDisplay = document.getElementById('curRoundDisplay');
    let totalRoundDisplay = document.getElementById('totalRoundDisplay');
    let controlButtons = document.getElementById(timerType + 'ControlButtons');
    let clockControls = document.getElementById('clockControls');

    let min = Math.floor(duration / 60);
    let sec = duration % 60;

    let start, ticks, diff, curRound, nextDur;
    start = ticks = diff = curRound = nextDur = 0;

    // Clear flags
    globalValues['cancel'] = false;
    globalValues['paused'] = false;

    // Switch to active timer display
    controlButtons.classList.add('hidden');
    clockControls.classList.remove('hidden');

    curRoundDisplay.innerHTML = curRound;
    totalRoundDisplay.innerHTML = totalRounds;

    /**
     *  Run timer
     */
    const runTimer = (remainingDuration) => {
        if (globalValues['cancel']) {
            remainingDuration = -1;
            curRound = totalRounds;
        }

        if (remainingDuration < 0) {
            if (curRound >= totalRounds) {
                // Clear timer display
                minDisplay.innerHTML = 0;
                secDisplay.innerHTML = String(0).padStart(2, '0');
                curRoundDisplay.innerHTML = 0;
                totalRoundDisplay.innerHTML = 0;

                // Switch back to standard display
                controlButtons.classList.remove('hidden');
                clockControls.classList.add('hidden');

                return;
            } else {
                // Begin next round
                curRound++;
                curRoundDisplay.innerHTML = curRound;
                remainingDuration = duration;
            }
        }

        // Update clock readout
        min = Math.floor(remainingDuration / 60);
        sec = remainingDuration % 60;

        minDisplay.innerHTML = min;
        secDisplay.innerHTML = String(sec).padStart(2, '0');

        nextDur = globalValues['paused'] ? remainingDuration : remainingDuration - 1;

        // Compensate for timer inaccuracy using system clock
        ticks += 1000;
        diff = (new Date().getTime() - start) - ticks;

        console.log('Sec ' + remainingDuration + ' Rd ' + curRound + ' Diff ' + diff);

        setTimeout(() => runTimer(nextDur), 1000 - diff);
    }

    start = new Date().getTime();
    setTimeout(() => runTimer(countIn), 1000);
}

/**
 *  Pause timer
 */
const pauseTimer = (button) => {
    let curState = globalValues['paused'];
    globalValues['paused'] = !curState;

    if (curState) {
        button.innerHTML = 'Pause';
    } else {
        button.innerHTML = 'Play';
    }
}

/**
 *  Cancel timer
 */
const cancelTimer = () => {
    globalValues['cancel'] = true;
}

document.addEventListener('DOMContentLoaded', function(event) {
    setDefaultValues();
});
