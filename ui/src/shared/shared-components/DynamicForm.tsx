// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm, Controller } from "react-hook-form";
// import { ZodSchema } from "zod";

// import { FieldConfig } from "./types";

// interface DynamicFormProps {
//   fields: FieldConfig[];

//   defaultValues?: Record<string, any>;

//   validationSchema?: ZodSchema;

//   submitButtonText?: string;

//   loading?: boolean;

//   disabled?: boolean;

//   onSubmit: (data: any) => void;
// }

// export const DynamicForm = ({
//   fields,
//   defaultValues,
//   validationSchema,
//   submitButtonText = "Submit",
//   loading,
//   disabled,
//   onSubmit,
// }: DynamicFormProps) => {
//   const {
//     register,
//     handleSubmit,
//     control,
//     formState: { errors },
//   } = useForm({
//     defaultValues,
//     resolver: validationSchema
//       ? zodResolver(validationSchema)
//       : undefined,
//   });

//   const renderField = (field: FieldConfig) => {
//     switch (field.type) {
//       case "textarea":
//         return (
//           <textarea
//             {...register(field.name)}
//             placeholder={field.placeholder}
//             rows={field.rows || 4}
//           />
//         );

//       case "select":
//         return (
//           <select {...register(field.name)}>
//             <option value="">Select</option>

//             {field.options?.map((option) => (
//               <option
//                 key={option.value}
//                 value={option.value}
//               >
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         );

//       case "checkbox":
//         return (
//           <input
//             type="checkbox"
//             {...register(field.name)}
//           />
//         );

//       case "radio":
//         return (
//           <>
//             {field.options?.map((option) => (
//               <label key={option.value}>
//                 <input
//                   type="radio"
//                   value={option.value}
//                   {...register(field.name)}
//                 />
//                 {option.label}
//               </label>
//             ))}
//           </>
//         );

//       case "file":
//         return (
//           <Controller
//             control={control}
//             name={field.name}
//             render={({ field: controllerField }) => (
//               <input
//                 type="file"
//                 accept={field.accept}
//                 onChange={(e) =>
//                   controllerField.onChange(
//                     e.target.files?.[0]
//                   )
//                 }
//               />
//             )}
//           />
//         );

//       default:
//         return (
//           <input
//             type={field.type}
//             placeholder={field.placeholder}
//             {...register(field.name)}
//           />
//         );
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       {fields.map((field) => (
//         <div key={field.name}>
//           <label>{field.label}</label>

//           {renderField(field)}

//           {errors[field.name] && (
//             <p>
//               {
//                 errors[field.name]
//                   ?.message as string
//               }
//             </p>
//           )}
//         </div>
//       ))}

//       <button
//         type="submit"
//         disabled={loading || disabled}
//       >
//         {loading
//           ? "Loading..."
//           : submitButtonText}
//       </button>
//     </form>
//   );
// };