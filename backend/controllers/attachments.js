import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { aws_accessToken, aws_secretKey, bucketName, region } from "../config/server-config.js";

const s3 = new S3Client({
  region: region,
  credentials: {
    accessKeyId: aws_accessToken,
    secretAccessKey: aws_secretKey
  }
});

const getAttachment = async (req, res) => {

  try {
    const checkExistence = await s3.send(new HeadObjectCommand({
      Bucket: bucketName,
      Key: "alyf_log.jp"
    }))
    console.log("if exists:", checkExistence);
    res.json({ msg: "existss" })

    // const command = new GetObjectCommand({
    //   Bucket: bucketName,
    //   Key: "",
    // });
    //
    // const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    // console.log(url);
    // res.json({
    //   url
    // })
  } catch (error) {
    console.log("error: ", error);
    res.status(404).json({
      error: error
    })
  }
}

const putAttachment = async (req, res) => {
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

  const buffer = req.file.buffer;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  });

  const response = await s3.send(command);
  console.log("responsne:", response);
  res.status(200).json({
    response
  })
}

export { putAttachment, getAttachment };
