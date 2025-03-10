fetch("http://127.0.0.1:3000/about")
  .then((res) => res.json())
  .then((json) => console.log(json));
