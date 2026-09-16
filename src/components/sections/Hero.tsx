"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/brand/LogoIcon";
import { BlobBackground } from "@/components/shared/BlobBackground";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream pb-20 pt-16 sm:pt-24">
      <BlobBackground />

      <div className="container-page relative flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <LogoIcon className="size-16 sm:size-20" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="max-w-3xl text-4xl font-bold leading-tight text-indigo sm:text-5xl md:text-6xl"
        >
          Learn Being <span className="text-gold">Future-Ready</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Learn Being Forward delivers placement-focused technical training to school students,
          college &amp; university students, and corporate freshers — through direct partnerships
          with colleges and companies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            render={<Link href="/courses" />}
            nativeButton={false}
            size="lg"
            className="bg-indigo px-6 text-white hover:bg-indigo/90"
          >
            Explore Courses
            <ArrowRight className="size-4" />
          </Button>
          <Button
            render={<Link href="/contact" />}
            nativeButton={false}
            size="lg"
            variant="outline"
            className="border-gold px-6 text-indigo hover:bg-gold"
          >
            Partner With Us
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
