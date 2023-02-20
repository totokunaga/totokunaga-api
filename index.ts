import app from "./api/app";

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Listening to client PORT ${PORT}`);
});
