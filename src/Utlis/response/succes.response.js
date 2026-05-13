// backend/src/Utlis/response/succes.response.js
export const successResponse = ({
  res,
  statusCode = 200,
  message = "Done",
  data = {},
}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};