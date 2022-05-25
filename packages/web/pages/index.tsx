import Router from "next/router";
import React, { useState, ChangeEvent, FormEvent } from "react";
import Layout from "../components/Layout";
import { v4 as uuidv4 } from "uuid";
import Container from "../components/Container";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import { allTargets } from "flok-core";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

const NewSessionForm = () => {
  const [targets, setTargets] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChangeTargets = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    setTargets(target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const uuid = btoa(uuidv4());
    const namePrefix = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: "-",
    });
    const session = `${namePrefix}-${uuid.slice(0, 8)}`;

    const layout = targets
      .split(",")
      .map((s) => s.trim())
      .join(",");
    Router.push(`/s/${session}?layout=${layout}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        name="targets"
        value={targets}
        placeholder={`Enter targets separated by commas (e.g. tidal,foxdot,etc.)`}
        autoFocus
        onChange={handleChangeTargets}
        disabled={submitting}
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create session"}
      </Button>
    </form>
  );
};

const Title = () => (
  <header>
    <h1>flok</h1>
    <h2>collaborative live coding editor</h2>
    <style jsx>{`
      header {
        margin-bottom: 3rem;
      }
      h1 {
        font-size: 40px;
        font-weight: 400;
        color: #fff;
        margin-top: 0;
        margin-bottom: 0.25em;
      }
      h2 {
        font-size: 1.17em;
        font-weight: 400;
        color: #eee;
        margin-top: 0;
      }
    `}</style>
  </header>
);

// The supported targets that can be entered in the form
const SupportedTargets = () => (
  <>
    <h3>currently supported targets:</h3>
    <ul>
      {allTargets.sort().map((target) => (
        <li key={target}>{target}</li>
      ))}
    </ul>
    <style jsx>{`
      h3 {
        font-size: 1 em;
        color: #aaa;
      }
      li {
        font-size: 0.8 em;
        color: #aaa;
      }
    `}</style>
  </>
);

const IndexPage = () => (
  <Layout>
    <Container>
      <Title />
      <NewSessionForm />
      <SupportedTargets />
    </Container>
  </Layout>
);

export default IndexPage;
