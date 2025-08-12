import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "./ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsComponent = ({}) => {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Tabs defaultValue="configuration">
        <TabsList className="flex w-full">
          <TabsTrigger className="w-full" value="configuration">
            Configuration
          </TabsTrigger>
          <TabsTrigger className="w-full" value="accessibility">
            Accessibility
          </TabsTrigger>
        </TabsList>
        <TabsContent value="configuration">
          <Card>
            <CardContent className="grid gap-6">
              <div className="grid gap-3 text-left">
                <Label className="mt-7" htmlFor="request-rate-slider">
                  Github API Request Rate (per min)
                </Label>
                <CardDescription>
                  Note: Applies only to requests made with a Personal Access
                  Token
                </CardDescription>
                <Slider
                  defaultValue={[50]}
                  max={100}
                  step={1}
                  className={""}
                  id="request-rate-slider"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>
                Change your password here. After saving, you&apos;ll be logged
                out.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-current">Current password</Label>
                <Input id="tabs-demo-current" type="password" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-new">New password</Label>
                <Input id="tabs-demo-new" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsComponent;
