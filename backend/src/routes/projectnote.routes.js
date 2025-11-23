import {Router} from "express";
import { get } from "mongoose";
import { validateProjectPermission } from "../middlewares/auth.middlewares";
import { UserRolesEnum } from "../utils/constants";


const router= Router();

router.route("/:projectId")
    .get(
        validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER]),
        getProjectNotes
    )
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN], UserRolesEnum.MEMBER),
        createProjectNote
    )


export default router;