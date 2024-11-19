'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useCompletion } from 'ai/react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MessageSchema } from '@/schemas/messageSchema';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: '/api/suggest-messages',
    initialCompletion: initialMessageString,
   
  });

  const form = useForm<z.infer<typeof MessageSchema>>({
    resolver: zodResolver(MessageSchema),
  });

  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof MessageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
        variant: 'default',
      });
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    try {
      complete('');

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200">
      <div className="max-w-4xl w-full bg-white shadow-md rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Send an Anonymous Message
          </h1>
          <p className="text-gray-600 mt-2">
            Share your thoughts with <span className="font-semibold">@{username}</span> anonymously.
          </p>
        </div>

        {/* Form Section */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Write your message here..."
                      className="w-full h-32 resize-none rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              {isLoading ? (
                <Button disabled className="w-full flex justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!messageContent}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
                >
                  Send Message
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Suggestions Section */}
        <div className="mt-12">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Suggested Messages
          </h2>
          <Card className="border border-gray-200 rounded-lg p-4">
            <CardHeader className="flex justify-between items-center">
              <h3 className="text-gray-700">Select a suggested message:</h3>
              <Button
                onClick={fetchSuggestedMessages}
                disabled={isSuggestLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                {isSuggestLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 mt-4">
              {error ? (
                <p className="text-red-500">{error.message}</p>
              ) : (
                parseStringMessages(completion).map((message, index) => (
                  <button
                    key={index}
                    onClick={() => handleMessageClick(message)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-200"
                  >
                    {message}
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Separator className="my-10" />

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Want your own message board? Sign up now!
          </p>
          <Link href="/sign-up">
            <Button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
              Create Your Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}