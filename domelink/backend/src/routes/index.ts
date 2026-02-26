
import { Router } from "express";

import { reviewRouter } from "./review.routes.js";
import { paymentRouter } from "./payment.routes.js";
import { fileRouter } from "./file.routes.js";
import { blogRouter } from "./blog.routes.js";
import { supportRouter } from "./support.routes.js";
import { styleQuizRouter } from "./styleQuiz.routes.js";
import budgetRouter from "./budget.routes.js";
import notificationRouter from "./notification.routes.js";

import { authRouter } from "./auth.routes.js";
import { architectRouter } from "./architect.routes.js";
import { consultationRouter } from "./consultation.routes.js";
import { chatRouter } from "./chat.routes.js";
import { portfolioRouter } from "./portfolio.routes.js";
import { userRouter } from "./user.routes.js";
import { teamRouter } from "./team.routes.js";
import { savedRouter } from "./saved.routes.js";
import { recommendationRouter } from "./recommendation.routes.js";
import { analyticsRouter } from "./analytics.routes.js";
import { projectBriefRouter } from "./project-brief.routes.js";
import { adminRouter } from "./admin.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/architects", architectRouter);
apiRouter.use("/consultations", consultationRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/portfolio", portfolioRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/team", teamRouter);
apiRouter.use("/saved", savedRouter);
apiRouter.use("/recommendations", recommendationRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/project-briefs", projectBriefRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/recommendations", styleQuizRouter);
apiRouter.use("/budget", budgetRouter);
apiRouter.use("/notifications", notificationRouter);

apiRouter.use("/reviews", reviewRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/files", fileRouter);
apiRouter.use("/blog", blogRouter);
apiRouter.use("/support", supportRouter);
