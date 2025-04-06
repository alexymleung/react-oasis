import { isFuture, isPast, isToday } from "date-fns";
import { useState } from "react";
import supabase from "../services/supabase";
import Button from "../ui/Button";
import { subtractDates } from "../utils/helpers";
import { bookings } from "./data-bookings";
import { cabins } from "./data-cabins";
import { guests } from "./data-guests";

async function deleteGuests() {
  const { error } = await supabase.from("guests").delete().gt("id", 0);
  if (error) console.error("Error deleting guests:", error.message);
  return !error;
}

async function deleteCabins() {
  const { error } = await supabase.from("cabins").delete().gt("id", 0);
  if (error) console.error("Error deleting cabins:", error.message);
  return !error;
}

async function deleteBookings() {
  const { error } = await supabase.from("bookings").delete().gt("id", 0);
  if (error) console.error("Error deleting bookings:", error.message);
  return !error;
}

async function createGuests() {
  const { error } = await supabase.from("guests").insert(guests);
  if (error) console.error("Error creating guests:", error.message);
  return !error;
}

async function createCabins() {
  const { error } = await supabase.from("cabins").insert(cabins);
  if (error) console.error("Error creating cabins:", error.message);
  return !error;
}

async function createBookings() {
  const { data: guestsIds } = await supabase
    .from("guests")
    .select("id")
    .order("id");
  const allGuestIds = guestsIds.map((cabin) => cabin.id);
  const { data: cabinsIds } = await supabase
    .from("cabins")
    .select("id")
    .order("id");
  const allCabinIds = cabinsIds.map((cabin) => cabin.id);

  const finalBookings = bookings.map((booking) => {
    const cabin = cabins.at(booking.cabinId - 1);
    const numNights = subtractDates(booking.endDate, booking.startDate);
    const cabinPrice = numNights * (cabin.regularPrice - cabin.discount);
    const extrasPrice = booking.hasBreakfast
      ? numNights * 15 * booking.numGuests
      : 0;
    const totalPrice = cabinPrice + extrasPrice;

    let status;
    if (
      isPast(new Date(booking.endDate)) &&
      !isToday(new Date(booking.endDate))
    )
      status = "checked-out";
    if (
      isFuture(new Date(booking.startDate)) ||
      isToday(new Date(booking.startDate))
    )
      status = "unconfirmed";
    if (
      (isFuture(new Date(booking.endDate)) ||
        isToday(new Date(booking.endDate))) &&
      isPast(new Date(booking.startDate)) &&
      !isToday(new Date(booking.startDate))
    )
      status = "checked-in";

    return {
      ...booking,
      numNights,
      cabinPrice,
      extrasPrice,
      totalPrice,
      guestId: allGuestIds.at(booking.guestId - 1),
      cabinId: allCabinIds.at(booking.cabinId - 1),
      status,
    };
  });

  const { error } = await supabase.from("bookings").insert(finalBookings);
  if (error) console.error("Error creating bookings:", error.message);
  return !error;
}

export default function Uploader() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadAll() {
    setIsLoading(true);
    setMessage("Starting upload...");

    try {
      // Bookings need to be deleted FIRST
      if (!(await deleteBookings()))
        throw new Error("Failed to delete bookings");
      if (!(await deleteGuests())) throw new Error("Failed to delete guests");
      if (!(await deleteCabins())) throw new Error("Failed to delete cabins");

      // Bookings need to be created LAST
      if (!(await createGuests())) throw new Error("Failed to create guests");
      if (!(await createCabins())) throw new Error("Failed to create cabins");
      if (!(await createBookings()))
        throw new Error("Failed to create bookings");

      setMessage("All data uploaded successfully!");
      console.log("All data uploaded successfully");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error("Upload failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function uploadBookings() {
    setIsLoading(true);
    setMessage("Starting bookings upload...");

    try {
      if (!(await deleteBookings()))
        throw new Error("Failed to delete bookings");
      if (!(await createBookings()))
        throw new Error("Failed to create bookings");

      setMessage("Bookings uploaded successfully!");
      console.log("Bookings uploaded successfully");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error("Bookings upload failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        marginTop: "auto",
        backgroundColor: "#e0e7ff",
        padding: "8px",
        borderRadius: "5px",
        textAlign: "center",
      }}
    >
      <h3>DEV AREA</h3>
      {message && <p>{message}</p>}

      <Button onClick={uploadAll} disabled={isLoading}>
        {isLoading ? "Uploading..." : "Upload ALL sample data"}
      </Button>
      <p>Only run this only once!</p>
      <p>
        <em>(Cabin images need to be uploaded manually)</em>
      </p>
      <hr />
      <Button onClick={uploadBookings} disabled={isLoading}>
        {isLoading ? "Uploading..." : "Upload CURRENT bookings"}
      </Button>
      <p>You can run this every day you develop the app</p>
    </div>
  );
}
