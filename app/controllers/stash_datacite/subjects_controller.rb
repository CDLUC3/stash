require_dependency 'stash_datacite/application_controller'

module StashDatacite
  class SubjectsController < ApplicationController
    before_action :set_subject, only: [:update, :destroy]

    # GET /subjects/new
    def new
      @subject = Subject.new
    end

    # POST /subjects
    def create
      @subject = Subject.new(subject_params)
      respond_to do |format|
        if @subject.save
          format.js
        else
          format.html { render :new }
        end
      end
    end

    # PATCH/PUT /subjects/1
    def update
      respond_to do |format|
        if @subject.update(subject_params)
          format.js
        else
          format.html { render :edit }
        end
      end
    end

    # DELETE /subjects/1
    def destroy
      @subject.destroy
      redirect_to subjects_url, notice: 'Subject was successfully destroyed.'
    end

    private

    # Use callbacks to share common setup or constraints between actions.
    def set_subject
      @subject = Subject.find(subject_params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def subject_params
      params.require(:subject).permit(:id, :subject, :subject_scheme, :scheme_URI, :resource_id)
    end
  end
end
