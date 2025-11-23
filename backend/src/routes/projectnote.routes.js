import {Router} from "express";
import {getProjectNotes,createProjectNote,getProjectNoteById} from "../controllers/projectnote.controllers.js"
import { validateProjectPermission } from "../middlewares/auth.middlewares";
import { AvailableUserRoles, UserRolesEnum,updateProjectNote ,deleteProjectNote} from "../utils/constants";


const router= Router();

router.route("/:projectId")
    .get(
        validateProjectPermission(AvailableUserRoles),
        getProjectNotes
    )
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        createProjectNote
    )

router
    .route("/:projectId/n/:noteId")
    .get(validateProjectPermission(AvailableUserRoles), getProjectNoteById)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateProjectNote)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProjectNote);  

export default router;