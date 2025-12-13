// DOM Elements
const calculateBtn = document.getElementById('calculateBtn');
const calculateQazaBtn = document.getElementById('calculateQazaBtn');
const contactMolviBtn = document.getElementById('contactMolviBtn');
const callMolviBtn = document.getElementById('callMolviBtn');
const molviModal = document.getElementById('molviModal');
const closeModalBtn = document.querySelector('.close-modal');

// User Data Storage
let userData = {
    name: '',
    birthDate: '',
    age: 0,
    prayerCount: 5,
    prayerTime: 15,
    sleepTime: 7,
    mobileTime: 120,
    washroomTime: 20,
    foodTime: 20,
    quranTime: 0,
    image: null
};

// Constants
const NAMAZ_PER_DAY = 5;
const DAYS_PER_YEAR = 365.2425; // including leap years
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR; // 1440
const STARTING_AGE = 12; // Namaz farz at 12 years

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set default birth date (born in 2000)
    const defaultDate = new Date();
    defaultDate.setFullYear(2000);
    defaultDate.setMonth(4); // May (0-indexed)
    defaultDate.setDate(8);

    const year = defaultDate.getFullYear();
    const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
    const day = String(defaultDate.getDate()).padStart(2, '0');
    const defaultDateStr = `${year}-${month}-${day}`;

    document.getElementById('birthDate').value = defaultDateStr;
    document.getElementById('userName').value = 'اسلامی یوزر';

    // Set min and max dates for date inputs
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(1900);
    const maxDate = new Date();

    const minDateStr = minDate.toISOString().split('T')[0];
    const maxDateStr = maxDate.toISOString().split('T')[0];

    document.getElementById('birthDate').min = minDateStr;
    document.getElementById('birthDate').max = maxDateStr;

    // Initialize user data
    updateUserData();

    // Set up event listeners
    setupEventListeners();

    // Calculate initial results
    calculateSpiritualData();
    calculateQazaData();

    // Set up projection buttons
    setupProjectionButtons();
});

// Set up event listeners
function setupEventListeners() {
    // Calculate button for section 1
    calculateBtn.addEventListener('click', function() {
        updateUserData();
        calculateSpiritualData();
        calculateQazaData();
    });

    // Calculate button for section 2
    calculateQazaBtn.addEventListener('click', function() {
        updateUserData();
        calculateQazaData();
    });

    // Mufti contact modal
    contactMolviBtn.addEventListener('click', function() {
        molviModal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', function() {
        molviModal.style.display = 'none';
    });

    // Call mufti button
    callMolviBtn.addEventListener('click', function() {
        const phoneNumber = '03078254820';
        if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = `tel:${phoneNumber}`;
        } else {
            alert(`مفتی صاحب کا نمبر: ${phoneNumber}\nڈیسکٹاپ سے براہ راست کال نہیں کی جا سکتی۔`);
        }
    });

    // Update data when inputs change
    const inputs = ['prayerCount','prayerTime','sleepTime','mobileTime','washroomTime','foodTime','birthDate','userName'];
    inputs.forEach(id => document.getElementById(id).addEventListener('change', updateUserData));
    document.getElementById('userName').addEventListener('input', updateUserData);
}

// Set up projection buttons
function setupProjectionButtons() {
    const projectionButtons = document.querySelectorAll('.projection-btn');
    projectionButtons.forEach(button => {
        button.addEventListener('click', function() {
            projectionButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updateLifeProjection(parseInt(this.dataset.years));
        });
    });
}

// Update user data from inputs
function updateUserData() {
    userData.name = document.getElementById('userName').value || 'اسلامی یوزر';
    userData.birthDate = document.getElementById('birthDate').value;
    userData.prayerCount = parseInt(document.getElementById('prayerCount').value);
    userData.prayerTime = parseInt(document.getElementById('prayerTime').value);
    userData.sleepTime = parseInt(document.getElementById('sleepTime').value);
    userData.mobileTime = parseInt(document.getElementById('mobileTime').value);
    userData.washroomTime = parseInt(document.getElementById('washroomTime').value);
    userData.foodTime = parseInt(document.getElementById('foodTime').value);
    userData.quranTime = 0;

    if (userData.birthDate) {
        const birthDate = new Date(userData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
        userData.age = Math.max(0, age);
    }

    document.getElementById('cardName').textContent = userData.name;
    document.getElementById('qazaName').textContent = userData.name;
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Calculate days between two dates
function daysBetweenDates(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.floor((endDate - startDate) / oneDay);
}

// Convert minutes to exact years, months, days
function convertMinutesToExactYearsMonthsDays(minutes) {
    const totalDays = minutes / MINUTES_PER_DAY;
    const years = Math.floor(totalDays / 365.2425);
    let remainingDays = totalDays - years * 365.2425;
    const months = Math.floor(remainingDays / 30.436875);
    remainingDays -= months * 30.436875;
    const days = Math.floor(remainingDays);
    return { years, months, days, totalDays };
}

// Format time display
function formatTimeDisplay(years, months, days) {
    let display = '';
    if (years > 0) display += `${years} سال`;
    if (months > 0) display += (display ? `، ${months} ماہ` : `${months} ماہ`);
    if (days > 0) display += (display ? ` اور ${days} دن` : `${days} دن`);
    if (!display) display = `0 دن`;
    return display;
}

// Calculate total prayers
function calculateTotalPrayers(yearsOfNamaz, prayerCount) {
    return Math.floor(yearsOfNamaz * DAYS_PER_YEAR * prayerCount);
}

// Calculate current time spent
function calculateCurrentTimeSpent() {
    if (!userData.birthDate || userData.age < STARTING_AGE) return {
        sleep: { years: 0, months: 0, days: 0 },
        food: { years: 0, months: 0, days: 0 },
        washroom: { years: 0, months: 0, days: 0 },
        mobile: { years: 0, months: 0, days: 0 }
    };

    const birthDate = new Date(userData.birthDate);
    const startDate = new Date(birthDate);
    startDate.setFullYear(birthDate.getFullYear() + STARTING_AGE);
    const endDate = new Date();

    const daysFrom12ToNow = daysBetweenDates(startDate, endDate);

    const sleepMinutes = daysFrom12ToNow * (userData.sleepTime * 60);
    const foodMinutes = daysFrom12ToNow * (userData.foodTime);
    const washroomMinutes = daysFrom12ToNow * (userData.washroomTime);
    const mobileMinutes = daysFrom12ToNow * (userData.mobileTime);

    return {
        sleep: convertMinutesToExactYearsMonthsDays(sleepMinutes),
        food: convertMinutesToExactYearsMonthsDays(foodMinutes),
        washroom: convertMinutesToExactYearsMonthsDays(washroomMinutes),
        mobile: convertMinutesToExactYearsMonthsDays(mobileMinutes)
    };
}

// Calculate spiritual data
function calculateSpiritualData() {
    const ageAfter12 = Math.max(0, userData.age - STARTING_AGE);
    const totalPrayersSoFar = calculateTotalPrayers(ageAfter12, userData.prayerCount);
    const totalPrayerMinutesSoFar = totalPrayersSoFar * userData.prayerTime;
    const prayerTimeSoFar = convertMinutesToExactYearsMonthsDays(totalPrayerMinutesSoFar);

    const dailyPrayerTime = userData.prayerCount * userData.prayerTime;

    const currentTimeSpent = calculateCurrentTimeSpent();

    document.getElementById('dailyPrayerTime').textContent = `${dailyPrayerTime} منٹ`;
    document.getElementById('totalPrayers').textContent = formatNumber(totalPrayersSoFar);
    document.getElementById('totalPrayerTime').textContent = formatTimeDisplay(prayerTimeSoFar.years, prayerTimeSoFar.months, prayerTimeSoFar.days);

    const birthDate = new Date(userData.birthDate);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    document.getElementById('totalAge').textContent = `${years} سال`;

    document.getElementById('lifetimeStats').innerHTML =
        `آپ نے اب تک اپنی زندگی کے <strong>${formatTimeDisplay(prayerTimeSoFar.years, prayerTimeSoFar.months, prayerTimeSoFar.days)}</strong> نماز پڑھی ہے۔ (12 سال کے بعد کا حساب)`;

    document.getElementById('cardAge').textContent = `عمر: ${years} سال`;

    document.getElementById('currentSleepTime').textContent =
        formatTimeDisplay(currentTimeSpent.sleep.years, currentTimeSpent.sleep.months, currentTimeSpent.sleep.days);
    document.getElementById('currentFoodTime').textContent =
        formatTimeDisplay(currentTimeSpent.food.years, currentTimeSpent.food.months, currentTimeSpent.food.days);
    document.getElementById('currentWashroomTime').textContent =
        formatTimeDisplay(currentTimeSpent.washroom.years, currentTimeSpent.washroom.months, currentTimeSpent.washroom.days);
    document.getElementById('currentMobileTime').textContent =
        formatTimeDisplay(currentTimeSpent.mobile.years, currentTimeSpent.mobile.months, currentTimeSpent.mobile.days);

    updateLifeProjection(60);
    updateLifeProjection(70);
    updateLifeProjection(80);

    sessionStorage.setItem('userSpiritualData', JSON.stringify({
        dailyPrayerTime,
        totalPrayers: totalPrayersSoFar,
        prayerYears: prayerTimeSoFar.years,
        prayerMonths: prayerTimeSoFar.months,
        prayerDays: prayerTimeSoFar.days,
        totalAge: years
    }));
}

// Calculate Qaza data
function calculateQazaData() {
    const prayersYears = parseInt(document.getElementById('prayersYears').value) || 0;
    const prayersMonths = parseInt(document.getElementById('prayersMonths').value) || 0;
    const prayerConsistency = parseInt(document.getElementById('prayerConsistency').value) || 100;

    const totalPrayedYears = prayersYears + (prayersMonths / 12);
    const prayersDone = calculateTotalPrayers(totalPrayedYears, userData.prayerCount);
    const adjustedPrayersDone = Math.floor(prayersDone * (prayerConsistency / 100));

    const ageAfter12 = Math.max(0, userData.age - STARTING_AGE);
    const totalObligatoryPrayers = calculateTotalPrayers(ageAfter12, NAMAZ_PER_DAY);
    const qazaPrayers = Math.max(0, totalObligatoryPrayers - adjustedPrayersDone);

    const qazaMinutes = qazaPrayers * userData.prayerTime;
    const qazaDays = Math.ceil(qazaMinutes / MINUTES_PER_DAY);
    const daysToComplete = Math.ceil(qazaPrayers / 5);

    document.getElementById('prayersDoneCount').textContent = formatNumber(adjustedPrayersDone);
    document.getElementById('totalQaza').textContent = formatNumber(qazaPrayers);
    document.getElementById('qazaTime').textContent = `${qazaDays} دن`;

    document.getElementById('qazaDetail').innerHTML =
        `آپ نے کل <strong>${formatNumber(adjustedPrayersDone)}</strong> نمازیں پڑھی ہیں۔<br>
         آپ کی <strong>${formatNumber(qazaPrayers)}</strong> نمازیں قضا ہیں۔<br>
         اگر آپ روز 5 قضا نمازیں پڑھیں، تو آپ انہیں <strong>${formatNumber(daysToComplete)} دن</strong> میں پورا کر سکتے ہیں۔`;

    const currentTimeSpent = calculateCurrentTimeSpent();
    document.getElementById('qazaSleepTime').textContent =
        formatTimeDisplay(currentTimeSpent.sleep.years, currentTimeSpent.sleep.months, currentTimeSpent.sleep.days);
    document.getElementById('qazaFoodTime').textContent =
        formatTimeDisplay(currentTimeSpent.food.years, currentTimeSpent.food.months, currentTimeSpent.food.days);
    document.getElementById('qazaWashroomTime').textContent =
        formatTimeDisplay(currentTimeSpent.washroom.years, currentTimeSpent.washroom.months, currentTimeSpent.washroom.days);
    document.getElementById('qazaMobileTime').textContent =
        formatTimeDisplay(currentTimeSpent.mobile.years, currentTimeSpent.mobile.months, currentTimeSpent.mobile.days);

    sessionStorage.setItem('userQazaData', JSON.stringify({
        prayersDone: adjustedPrayersDone,
        qazaPrayers,
        qazaDays,
        daysToComplete,
        prayerConsistency
    }));
}

// Update life projection for any age
function updateLifeProjection(totalLifeYears) {
    const currentAge = userData.age;
    const yearsLivedAfter12 = Math.max(0, currentAge - STARTING_AGE);
    const totalLifeNamazYears = Math.max(0, totalLifeYears - STARTING_AGE);

    const totalLifePrayers = calculateTotalPrayers(totalLifeNamazYears, NAMAZ_PER_DAY);
    const prayersAlreadyDone = calculateTotalPrayers(yearsLivedAfter12, userData.prayerCount);

    const totalPrayerMinutes = totalLifePrayers * userData.prayerTime;
    const totalPrayerTime = convertMinutesToExactYearsMonthsDays(totalPrayerMinutes);

    const alreadyPrayedMinutes = prayersAlreadyDone * userData.prayerTime;
    const alreadyPrayedTime = convertMinutesToExactYearsMonthsDays(alreadyPrayedMinutes);

    const birthDate = new Date(userData.birthDate);
    const startDate = new Date(birthDate);
    startDate.setFullYear(birthDate.getFullYear() + STARTING_AGE);
    const endDate = new Date(birthDate);
    endDate.setFullYear(birthDate.getFullYear() + totalLifeYears);

    const totalDaysFrom12ToEnd = daysBetweenDates(startDate, endDate);

    const totalSleepMinutes = totalDaysFrom12ToEnd * (userData.sleepTime * 60);
    const totalMobileMinutes = totalDaysFrom12ToEnd * userData.mobileTime;
    const totalWashroomMinutes = totalDaysFrom12ToEnd * userData.washroomTime;
    const totalFoodMinutes = totalDaysFrom12ToEnd * userData.foodTime;

    const sleepTime = convertMinutesToExactYearsMonthsDays(totalSleepMinutes);
    const mobileTime = convertMinutesToExactYearsMonthsDays(totalMobileMinutes);
    const washroomTime = convertMinutesToExactYearsMonthsDays(totalWashroomMinutes);
    const foodTime = convertMinutesToExactYearsMonthsDays(totalFoodMinutes);

    const totalSpentDays = sleepTime.totalDays + mobileTime.totalDays + washroomTime.totalDays + foodTime.totalDays + totalPrayerTime.totalDays;
    const totalLifeDays = (totalLifeYears - STARTING_AGE) * DAYS_PER_YEAR;
    const remainingDays = Math.max(0, totalLifeDays - totalSpentDays);
    const remainingTime = convertMinutesToExactYearsMonthsDays(remainingDays * MINUTES_PER_DAY);

    document.getElementById('lifeAnalysis').innerHTML =
        `<p><strong>${totalLifeYears} سال کی زندگی کا مکمل تجزیہ:</strong></p>
         <p>• کل نماز کا وقت تقریباً: <strong>${formatTimeDisplay(totalPrayerTime.years, totalPrayerTime.months, totalPrayerTime.days)}</strong></p>
         <p>• اب تک پڑھی تقریباً: <strong>${formatTimeDisplay(alreadyPrayedTime.years, alreadyPrayedTime.months, alreadyPrayedTime.days)}</strong></p>
         <p>• کل سونے کا وقت تقریباً: <strong>${formatTimeDisplay(sleepTime.years, sleepTime.months, sleepTime.days)}</strong></p>
         <p>• کل موبائل کا وقت تقریباً: <strong>${formatTimeDisplay(mobileTime.years, mobileTime.months, mobileTime.days)}</strong></p>
         <p>• کل بیت الخلا کا وقت تقریباً: <strong>${formatTimeDisplay(washroomTime.years, washroomTime.months, washroomTime.days)}</strong></p>
         <p>• کل کھانے کا وقت تقریباً: <strong>${formatTimeDisplay(foodTime.years, foodTime.months, foodTime.days)}</strong></p>
         <p>• باقی بچے ہوئے دن آپ نے اپنے ذاتی کام میں گزارے ہیں  : <strong>${formatTimeDisplay(remainingTime.years, remainingTime.months, remainingTime.days)}</strong></p>`;
}

// Clear session on refresh
window.addEventListener('beforeunload', function() {
    sessionStorage.clear();
});