
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const ConfigSchema = z.object({
  baseUrl: z.string().url("Please enter a valid URL"),
});

type ConfigFormValues = z.infer<typeof ConfigSchema>;

const Administration: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("configuration");

  // Initialize form with default values
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(ConfigSchema),
    defaultValues: {
      baseUrl: localStorage.getItem("baseUrl") || "https://ce0e62e07320a0.lhr.life",
    },
  });

  // Handle form submission
  const onSubmit = (data: ConfigFormValues) => {
    try {
      // Save to localStorage
      localStorage.setItem("baseUrl", data.baseUrl);
      toast.success("Configuration saved successfully");
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Failed to save configuration");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="configuration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>
                    Configure global settings for the application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="baseUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Base URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://api.example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              The base URL for all API requests
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit">Save Configuration</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Users Management</CardTitle>
                  <CardDescription>Manage system users</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>User management functionality will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="roles">
              <Card>
                <CardHeader>
                  <CardTitle>Roles & Permissions</CardTitle>
                  <CardDescription>Configure user roles and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Role management functionality will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Administration;
