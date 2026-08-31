import { Router } from "express";
import regionRoutes from "./regionRoutes.js";
import estateRoutes from "./estateRoutes.js";
import designRoutes from "./designRoutes.js";
import propertyRoutes from "./propertyRoutes.js";
import enquiryRoutes from "./enquiryRoutes.js";
import testimonialRoutes from "./testimonialRoutes.js";
import consultantRoutes from "./consultantRoutes.js";
import inclusionRoutes from "./inclusionRoutes.js";
import favoriteRoutes from "./favoriteRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import studioRoutes from "./studioRoutes.js";
import galleryRoutes from "./galleryRoutes.js";
import documentRoutes from "./documentRoutes.js";

const router = Router();

// Mount routes
router.use("/regions", regionRoutes);
router.use("/estates", estateRoutes);
router.use("/designs", designRoutes);
router.use("/properties", propertyRoutes);
router.use("/enquiries", enquiryRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/consultants", consultantRoutes);
router.use("/inclusions", inclusionRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/settings", settingsRoutes);
router.use("/upload", uploadRoutes);
router.use("/studio", studioRoutes);
router.use("/gallery", galleryRoutes);

// Document engine: tenders, templates, clause library, branding
router.use("/documents", documentRoutes);

export default router;
