const logger = () => {
    const time = new Date().toTimeString();
    console.log('The time is ' + time);
}

const timer = (() => {
    setInterval(() => {
        logger();
    }, 60000)
})();