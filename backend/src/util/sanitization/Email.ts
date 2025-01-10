import validator from "validator";

export default function checkValidEmail(email: string) {
  const isValidEmail = validator.isEmail(email);
  if (!isValidEmail) {
    throw Error("Please enter a valid email!");
  }
}
