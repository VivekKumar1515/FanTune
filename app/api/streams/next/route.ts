import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { use } from "react";


export async function GET() {
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

    console.log("HEy")

    try {
        //getting the stream with higest vote yet

        const mostUpvoteStream = await prismaClient.stream.findFirst({
            where: {
                userId: user.id,
                played: false
            }, 
            orderBy: {
                upvotes: {
                    _count: "desc"
                }
            }
        })

        await Promise.all([prismaClient.currentStream.upsert({
            where: {
                userId: user.id
            }, 
            update: {
                userId: user.id,
                streamId: mostUpvoteStream?.id
            }, 
            create: {
                userId: user.id,
                streamId: mostUpvoteStream?.id
            }
        }), prismaClient.stream.update({
            where: {
                id: mostUpvoteStream?.id
            },
            data: {
                played: true,
                playedAt: new Date(),
            }
        })])


        return NextResponse.json({
            stream: mostUpvoteStream,
        })

    } catch(e) {
        return NextResponse.json({
            message: "Oops! Something occured"
        }, {
            status: 500
        })
    }
}