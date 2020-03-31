function f(a) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(a)
    })
  })
}


async function k(){
  let res = await f(1)
  console.log(res)
}

k().then()

let a = {
  firstname: 'Paul',
  lastname: 'Pihus',
  getFullName: function () {
    return this.firstname + this.lastname
  }
}

console.log(a.getFullName())

