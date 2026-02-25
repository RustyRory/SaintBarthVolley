import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/dist/client/link";

export function RegisterForm({ ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Entrez vos informations ci-dessous pour créer votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nom</FieldLabel>
              <Input id="name" type="text" placeholder="Nom" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="first-name">Prénom</FieldLabel>
              <Input
                id="first-name"
                type="text"
                placeholder="Prénom"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Doit contenir au moins 8 caractères."
                required
              />
            </Field>
            <Field>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirmer le mot de passe"
                required
              />
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Créer un compte</Button>
                <FieldDescription className="px-6 text-center">
                  Vous avez déjà un compte ?{" "}
                  <Link href="/login">Connectez-vous</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
