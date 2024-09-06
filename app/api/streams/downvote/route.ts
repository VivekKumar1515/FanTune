import { prismaClient } from "@/app/lib/db";
import { PrismaClient } from "@prisma/client/extension";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";
import { json } from "stream/consumers";
import { z } from "zod";

const createUpvoteSchema = z.object({
    streamId: z.string(),
});

export async function POST(req: NextRequest) {
    const session = await getServerSession();

    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    })

    if(!user) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        })
    }

    try {
        const data = createUpvoteSchema.parse(await req.json());
        await prismaClient.upvotes.delete({
            where: {
                userId_streamId: {
                    userId: user.id,
                    streamId: data.streamId
                }
            }
        });

        return NextResponse.json({
            message: "Downvote Added!"
        }, {
            status: 200
        })
    } catch(e) {
        return NextResponse.json({
            message: "Error while adding upvoting"
        }, {
            status: 403
        })
    }
}


