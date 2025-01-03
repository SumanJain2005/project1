'use client'
import {zodResolver} from "@hookform/resolvers/zod"
import { useForm} from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import {  useState } from "react"

import { useToast } from "@/hooks/use-toast"

import { signInSchema } from "@/schemas/signInSchema"


import { Form, FormItem } from "@/components/ui/form"
import { FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FormLabel , FormControl ,  FormMessage} from "@/components/ui/form"
import { Button } from "@/components/ui/button"

import { useRouter } from "next/navigation";

import { signIn } from "next-auth/react"

const Page = () =>{


  const [isSubmitting] = useState(false) 
  const router = useRouter();
  const {toast} = useToast();

  

  //zod validation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    }
  })

  
  const onSubmit = async(data:z.infer<typeof signInSchema>) =>{
    const result = await signIn("credentials" , {
      redirect : false  ,
      identifier : data.identifier,
      password : data.password,
     
    })
    if(result?.error){
      console.log("Sign-in error:", result.error);
      if(result.error == "CredentialsSignin"){
        toast({
          title : "Sign In Failed",
          description : "Invalid credentials",
          variant : "destructive"
        })
      }
      else{
        toast({
          title : "Error",
          description : result.error,
          variant : "destructive"
        })
      }
    }
    if (result?.ok && !result.error) {
      
      // Optional: Add a delay to ensure session is set before redirect
      setTimeout(() => {
        router.replace("/dashboard");
      }, 200);
    }
    
 }; 
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6">
        <FormField
          name="identifier"
          control={form.control} 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email/Username</FormLabel>
              <FormControl>
                <Input placeholder="Email/Username" {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="password"
          control={form.control} 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <Button type="submit" disabled={isSubmitting} >
          
            Signin
        </Button>
        </form> 
      </Form>
      <div className="text-center mt-4">
          <p>
            Not a Member yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default Page