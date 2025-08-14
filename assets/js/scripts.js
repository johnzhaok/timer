/**
 *  Default values
 */
const DEFAULT_SETTINGS = {
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

/**
 *  Currently set global values
 */
const CURRENT_SETTINGS = {
    'emom': {},
    'amrap': {},
    'paused': false,
    'cancel': false
}

const AUDIO_CONTEXT = new AudioContext();


/**
 *  Set default values
 *  @param {string} resetType - Timer type to reset ('emom' or 'amrap')
 */
const setDefaultValues = (resetType) => {
    for (let [type, values] of Object.entries(DEFAULT_SETTINGS)) {
        if (resetType == null || type == resetType) {
            for (let [id, value] of Object.entries(values)) {
                let el = document.getElementById(id);

                if (el !== null) {
                    CURRENT_SETTINGS[type][id] = value;
                    el.innerHTML = id.includes('Duration') ? value / 60 : value;
                }
            }

            calculateTotalDuration(type);
        }
    }
}

/**
 *  Calculate total workout duration
 *  @param {string} type - Timer type ('emom' or 'amrap')
 */
const calculateTotalDuration = (type) => {
    let totalDisplay = document.getElementById(type + 'Total');
    let countIn = CURRENT_SETTINGS[type][type + 'CountIn'];
    let duration = CURRENT_SETTINGS[type][type + 'Duration'];
    let rounds = CURRENT_SETTINGS[type][type + 'Rounds'] ?? 1;

    let totalDuration = countIn + (duration * rounds);
    let min = Math.floor(totalDuration / 60);
    let sec = totalDuration % 60;

    totalDisplay.innerHTML = min + ':' + String(sec).padStart(2, '0');
}

/**
 *  Increment or decrement time or round settings
 *  @param {string} type - Timer type ('emom' or 'amrap')
 *  @param {string} id - ID of field being adjusted
 *  @param {number} interval - Interval to increment or decrement the field (in seconds for duration)
 */
const adjustSetting = (type, id, interval) => {
    let item = document.getElementById(id);

    if (item == null) {
        return;
    }

    let curValue = CURRENT_SETTINGS[type][id];
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
        CURRENT_SETTINGS[type][id] = newValue;
        item.innerHTML = id.includes('Duration') ? newValue / 60 : newValue;
    }

    calculateTotalDuration(type);
}

/**
 *  Switch timer type
 *  @param {Object} element - Button element
 *  @param {string} type - Timer type ('emom' or 'amrap')
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
 *  @param {string} timerType - Timer type (emom or amrap)
 */
const startTimer = async (timerType) => {
    let data = CURRENT_SETTINGS[timerType];
    let countIn = data[timerType + 'CountIn'];
    let duration = data[timerType + 'Duration'];
    let totalRounds = data[timerType + 'Rounds'] ?? 1;

    let minDisplay = document.getElementById('minDisplay');
    let secDisplay = document.getElementById('secDisplay');
    let curRoundDisplay = document.getElementById('curRoundDisplay');
    let totalRoundDisplay = document.getElementById('totalRoundDisplay');
    let clockControls = document.getElementById('clockControls');

    let min = Math.floor(duration / 60);
    let sec = duration % 60;

    let start, ticks, diff, curRound, nextDur;
    start = ticks = diff = curRound = nextDur = 0;

    // Request wake lock
    let wakeLock = await navigator.wakeLock.request('screen');

    // Clear flags
    CURRENT_SETTINGS['cancel'] = false;
    CURRENT_SETTINGS['paused'] = false;

    // Switch to active timer display layout
    clockControls.classList.remove('hidden');

    for (let [type, values] of Object.entries(DEFAULT_SETTINGS)) {
        document.getElementById(type + 'ControlButtons')
            .classList.add('hidden');
    }

    curRoundDisplay.innerHTML = curRound;
    totalRoundDisplay.innerHTML = totalRounds;

    /**
     *  Generate audio cues
     *  @param {number} [frequency = 440] - Tone frequency in Hz
     *  @param {number} [duration = 0.1] - Duration in seconds (1 = 1 second)
     *  @param (number) [volume = 0.3] - Volume from 0 to 1 (1 = 100% volume)
     *
     */
    const beep = (frequency = 440, duration = 0.1, volume = 0.3) => {
        let osc = AUDIO_CONTEXT.createOscillator();
        let gain = AUDIO_CONTEXT.createGain();

        osc.connect(gain);
        osc.frequency.value = frequency;
        osc.type = 'square';

        gain.connect(AUDIO_CONTEXT.destination);
        gain.gain.value = volume;

        osc.start(AUDIO_CONTEXT.currentTime);
        osc.stop(AUDIO_CONTEXT.currentTime + duration);
    }

    /**
     *  Run timer
     *  @param {number} remainingDuration - Number of seconds remaining on timer
     */
    const runTimer = async (remainingDuration) => {
        if (CURRENT_SETTINGS['cancel']) {
            remainingDuration = -1;
            curRound = totalRounds;
        }

        if (remainingDuration <= 0) {
            if (curRound >= totalRounds) {
                // Clear timer display
                minDisplay.innerHTML = 0;
                secDisplay.innerHTML = String(0).padStart(2, '0');
                curRoundDisplay.innerHTML = 0;
                totalRoundDisplay.innerHTML = 0;
                beep(220, 0.5);

                // Release wake lock
                await wakeLock.release().then(() => wakeLock = null);

                // Switch back to standard display layout
                clockControls.classList.add('hidden');

                for (let [type, values] of Object.entries(DEFAULT_SETTINGS)) {
                    document.getElementById(type + 'ControlButtons')
                        .classList.remove('hidden');
                }

                return;
            } else {
                // Begin next round
                curRound++;
                curRoundDisplay.innerHTML = curRound;
                remainingDuration = duration;
                beep(880, 0.5);
            }
        }

        // Update clock readout
        min = Math.floor(remainingDuration / 60);
        sec = remainingDuration % 60;

        minDisplay.innerHTML = min;
        secDisplay.innerHTML = String(sec).padStart(2, '0');

        nextDur = CURRENT_SETTINGS['paused'] ? remainingDuration : remainingDuration - 1;

        nextDur < 3 && beep();

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
 *  @param {Object} button - Button element
 */
const pauseTimer = (button) => {
    let curState = CURRENT_SETTINGS['paused'];
    CURRENT_SETTINGS['paused'] = !curState;

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
    CURRENT_SETTINGS['cancel'] = true;
}

document.addEventListener('DOMContentLoaded', function(event) {
    setDefaultValues();
});
