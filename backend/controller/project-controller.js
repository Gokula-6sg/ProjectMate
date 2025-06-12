const prisma = require('../utils/prismaClient')


//Create new project

const createProject = async (req, res) => {
    const {title, description, tags} = req.body

    try {

        const project = await prisma.projects.create(
            {
                data: {
                    title,
                    description,
                    tags,
                    ownerId: req.user.userid,
                    members: []
                }
            }
        )
        if (project) {
            console.log(req.user.id)
            res.status(200).json({
                status: 'success',
                message: 'Project created',
            })
        }

    } catch (err) {
        console.log(err)
        res.status(400).json({
            message: 'Could not create project',
        })
    }
}


    //Get all the project

    const getAllProjects = async (req, res) => {
        try{
            const projects = await prisma.projects.findMany({
                include : {
                    owner : {
                        select: {
                            id: true,
                            username: true,
                            skills : true,
                            rating: true
                        }

                    }},
            })

            res.json(projects);


        }catch(err){
            res.status(400).json({
                success: false,
                message: 'Could not get all projects',
            })
        }
    }


    //Get Single project
    const getProjectById = async (req, res) => {
        const {id} = req.params

        try{
            const project = await prisma.projects.findUnique({
                where: {id},
                include: {owner : true},
            })

            if(!project){
                return res.status(404).send({
                    message: 'Project not found',
                })
            }

            return res.json(project);


        }catch(err){
            res.status(400).json({
                success: false,
                message: 'Could not get project',
            })
        }
    }

    //Get project by tags

    const getProjectbytag = async (req, res) => {
        const {tag} = req.params
try {
    const project = await prisma.projects.findMany({
        where: {
            tags: {
                has: tag,
            }
        },
        include: {owner: true},
    })
    if(project){
        res.status(200).json(project);

    }
}catch(err){
    console.log(err)
            res.status(400).json({
                success: false,
                message: 'Could not get project',
            })
}

    }



    const updateProject = async (req, res) => {
        const {id} = req.params
        const {title, description, tags} = req.body

        try{
            const exist = await prisma.projects.findUnique({
                where: {id},
            })
            if(!exist){
                return res.status(404).send({
                    message: 'Project not found',
                })
            }
            if(exist.ownerId !== req.user.userid){
                res.status(404).json({
                    success: false,
                    message: 'Not authorized',
                })
            }


            const update = await prisma.projects.update({
                where: {id},
                data: {
                    title,
                    description,
                    tags,
                }
            })
            res.json(update);

            res.status(200).json({
                status: 'success',
                message: 'Project updated',

            })
        }catch(err){
            console.log(err)
            res.status(400).json({
                success: false,
                message: 'Could not update project',
            })
        }
    }



    const deleteProject = async (req, res) => {
        const {id} = req.params
        try {

            const project = await prisma.projects.findUnique({
                where: {id}
            })

            if(!project){
                return res.status(404).send({
                    message: 'Project Not found',
                })
            }

            if (project.ownerId !== req.user.userid) {
                console.log(req.user.id)
                return res.status(404).json({

                    success: false,
                    message: 'Not authorized',

                })
            }


            await prisma.projects.delete({
                where: {id},
            })
             return res.status(202).json({
                status: 'success',
                message: 'Project deleted',
            })

        }catch(err){
            console.log(err)
            res.status(400).json({
                success: false,
                message: 'Could not delete project',
            })
        }


    }

    module.exports = {
        createProject,
        getAllProjects,
        getProjectById,
        updateProject,
        deleteProject,
        getProjectbytag,
    }




