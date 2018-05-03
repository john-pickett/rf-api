let a = 3;
let b = 4;

const adder = ((a, b) => {
    console.log(a + b);
});

waiter = setTimeout(() => {
    console.log('hey')
}, 2000);

logger = (() => {
    console.log('hey')
    setTimeout(() => {
        console.log('hello')
    }, 2000)
    console.log('hi')
})();