import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectsCommand, S3ServiceException, waitUntilObjectNotExists } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';
import prisma from "../config/prisma-signleton.js"; // Your prisma client
import { aws_accessToken, aws_secretKey, bucketName, region } from "../config/server-config.js";
import { useId } from "react";

const s3 = new S3Client({
  region: region,
  credentials: { accessKeyId: aws_accessToken, secretAccessKey: aws_secretKey }
});

export const uploadAttachment = async (req, res) => {
  try {
    const { cardId } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "File size exceeds 5MB limit" });
    }

    const fileKey = `${uuidv4()}-${file.originalname}`;

    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype
    }));

    const attachment = await prisma.attachments.create({
      data: {
        fileName: file.originalname,
        fileKey: fileKey,
        fileType: file.mimetype,
        cardId: cardId
      }
    });

    const signedUrl = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: bucketName, Key: fileKey
    }), { expiresIn: 3600 });

    res.status(200).json({ ...attachment, url: signedUrl });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

export const getAttachmentUrl = async (req, res) => {
  try {
    const { key } = req.query;
    console.log("key in getAttachmentUrl:", key);
    const url = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: bucketName, Key: key
    }), { expiresIn: 3600 });
    console.log("url:", url);
    res.json({ url });
  } catch (err) { res.status(500).json({ error: "Failed to get URL" }) }
}

export const deleteAttachment = async (req, res) => {
  console.log("deleteAttachment");
  try {
    const { key, fileKey } = req.params;
    console.log("key:", fileKey);

    const attachment = await prisma.attachments.findFirst({ where: { fileKey } });
    console.log(attachment);
    if (!attachment) return res.status(404).json({ error: "Attachment not found" });

    const deleteAttachmentResponse = await s3.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: attachment.fileKey
    }));
    console.log("deleteAttachmentResponse:", deleteAttachmentResponse);

    if (deleteAttachmentResponse.$metadata.httpStatusCode === 204) {
      await prisma.attachments.delete({ where: { fileKey } });
      res.status(200).json({ message: "Attachment deleted" });
    } else {
      console.log("Attachment not found in s3");
    }

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete attachment" });
  }
};

export const deleteAttachmentsFunction = async (attachmentKeys) => {
  if (!attachmentKeys || attachmentKeys.length <= 0) return "No id found";
  try {
    console.log("attachmentKeys in deleteAttachmentsFunction", attachmentKeys);

    //TODO: check if the key exists no tdoing now becuase of charges 

    const deleteMultipleAttachmentResponse = await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: attachmentKeys.map((k) => ({ Key: k })),
        },
      }),
    );
    console.log("deleteMultipleAttachmentResponse:", deleteMultipleAttachmentResponse);
    const { Deleted } = deleteMultipleAttachmentResponse;
    return Deleted.length > 0 && Deleted;
  } catch (caught) {
    if (
      caught instanceof S3ServiceException &&
      caught.name === "NoSuchBucket"
    ) {
      throw error(
        `Error from S3 while deleting objects from ${bucketName}. The bucket doesn't exist.`,
      );
    } else if (caught instanceof S3ServiceException) {
      throw error(
        `Error from S3 while deleting objects from ${bucketName}.  ${caught.name}: ${caught.message}`,
      );
    } else {
      return (caught);
    }
  }
}


